<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/MatchingEngine.php');
require_once('../../services/NotificationService.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

// Strict server-side verification: authenticated + non-suspended user in MySQL
$authenticatedUser = requireAuth($conn);
$user_id = (int)$authenticatedUser["id"];

// Parse data (supports both multipart/form-data and JSON)
$title = "";
$type = "";
$category = "";
$location = "";
$item_date = "";
$description = "";
$jsonData = null;

if (!empty($_POST["title"]) || !empty($_POST["type"])) {
    $title = trim($_POST["title"] ?? "");
    $type = trim($_POST["type"] ?? "");
    $category = trim($_POST["category"] ?? "");
    $location = trim($_POST["location"] ?? "");
    $item_date = trim($_POST["item_date"] ?? $_POST["date"] ?? "");
    $description = trim($_POST["description"] ?? "");
    validateCsrfToken($_POST);
} else {
    $jsonData = json_decode(file_get_contents("php://input"), true) ?: [];
    validateCsrfToken($jsonData);
    $title = trim($jsonData["title"] ?? "");
    $type = trim($jsonData["type"] ?? "");
    $category = trim($jsonData["category"] ?? "");
    $location = trim($jsonData["location"] ?? "");
    $item_date = trim($jsonData["item_date"] ?? $jsonData["date"] ?? "");
    $description = trim($jsonData["description"] ?? "");
}

// Validation
if ($title === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Item name is required."]);
    exit;
}

if ($type !== "lost" && $type !== "found") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid item type (lost or found) is required."]);
    exit;
}

if ($category === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Category is required."]);
    exit;
}

if ($location === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Location is required."]);
    exit;
}

if ($item_date === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please select a valid date."]);
    exit;
}

if ($description === "") {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Description is required."]);
    exit;
}

// Handle Image Upload if present
$image_path = null;

if (isset($_FILES["image"]) && $_FILES["image"]["error"] === UPLOAD_ERR_OK) {
    $fileTmpPath = $_FILES["image"]["tmp_name"];
    $fileName = $_FILES["image"]["name"];
    $fileSize = $_FILES["image"]["size"];
    $fileType = $_FILES["image"]["type"];
    
    // Max 5MB
    if ($fileSize > 5 * 1024 * 1024) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Image file size exceeds maximum limit of 5MB."]);
        exit;
    }
    
    $allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    $allowedExts = ["jpg", "jpeg", "png", "webp"];
    
    $fileInfo = pathinfo($fileName);
    $ext = strtolower($fileInfo["extension"] ?? "");
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = finfo_file($finfo, $fileTmpPath);
    finfo_close($finfo);
    
    if (!in_array($detectedMime, $allowedMimes) || !in_array($ext, $allowedExts)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid image format. Only JPG, PNG, and WEBP formats are accepted."]);
        exit;
    }

    // Verify true image structure and dimensions to block polyglot script payloads
    $imgSize = @getimagesize($fileTmpPath);
    if ($imgSize === false || empty($imgSize[0]) || empty($imgSize[1])) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Uploaded file is not a valid image or is corrupted."]);
        exit;
    }
    
    $uploadDir = __DIR__ . "/../../uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }
    
    $newFileName = "item_" . time() . "_" . bin2hex(random_bytes(8)) . "." . $ext;
    $destPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $image_path = "uploads/" . $newFileName;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save uploaded image."]);
        exit;
    }
}
// Student reports require administrative verification before becoming active.
// Admin submissions are published immediately.
$status = (($authenticatedUser["role"] ?? "") === "admin") ? "active" : "pending";

$stmt = $conn->prepare(
    "INSERT INTO items (user_id, type, title, description, category, location, item_date, image, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "issssssss",
    $user_id,
    $type,
    $title,
    $description,
    $category,
    $location,
    $item_date,
    $image_path,
    $status
);

if ($stmt->execute()) {
    $item_id = $stmt->insert_id;

    // Trigger Smart Matching Engine for the newly created item
    try {
        MatchingEngine::runForItem($conn, $item_id);
    } catch (\Throwable $e) {
        error_log("MatchingEngine error: " . $e->getMessage());
    }

    // Notify campus administrators about the new pending report
    try {
        $adminQuery = $conn->query("SELECT id FROM users WHERE role = 'admin'");
        if ($adminQuery) {
            while ($adminRow = $adminQuery->fetch_assoc()) {
                $adminId = (int)$adminRow["id"];
                if ($adminId !== $user_id) {
                    NotificationService::create(
                        $conn,
                        $adminId,
                        "New " . ucfirst($type) . " Report: " . $title,
                        "A student reported a " . $type . " item '" . $title . "' (" . ($location ?: "Campus") . ").",
                        "report_created",
                        $item_id,
                        null,
                        false
                    );
                }
            }
        }
    } catch (\Throwable $e) {
        error_log("Admin report notification error: " . $e->getMessage());
    }

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Report submitted successfully.",
        "item" => [
            "id" => $item_id,
            "user_id" => $user_id,
            "type" => $type,
            "title" => $title,
            "category" => $category,
            "location" => $location,
            "item_date" => $item_date,
            "description" => $description,
            "image" => $image_path,
            "status" => $status
        ]
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to save item: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();

?>
