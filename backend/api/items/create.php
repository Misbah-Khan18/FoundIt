<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/MatchingEngine.php');

// Check authentication
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required. Please log in."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];

// Parse data (supports both multipart/form-data and JSON)
$title = "";
$type = "";
$category = "";
$location = "";
$item_date = "";
$description = "";

if (isset($_POST["title"])) {
    $title = trim($_POST["title"] ?? "");
    $type = trim($_POST["type"] ?? "");
    $category = trim($_POST["category"] ?? "");
    $location = trim($_POST["location"] ?? "");
    $item_date = trim($_POST["item_date"] ?? "");
    $description = trim($_POST["description"] ?? "");
} else {
    $jsonData = json_decode(file_get_contents("php://input"), true);
    if ($jsonData) {
        $title = trim($jsonData["title"] ?? "");
        $type = trim($jsonData["type"] ?? "");
        $category = trim($jsonData["category"] ?? "");
        $location = trim($jsonData["location"] ?? "");
        $item_date = trim($jsonData["item_date"] ?? "");
        $description = trim($jsonData["description"] ?? "");
    }
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
    
    $allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    $allowedExts = ["jpg", "jpeg", "png", "webp", "gif"];
    
    $fileInfo = pathinfo($fileName);
    $ext = strtolower($fileInfo["extension"] ?? "");
    
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $detectedMime = finfo_file($finfo, $fileTmpPath);
    finfo_close($finfo);
    
    if (!in_array($detectedMime, $allowedMimes) || !in_array($ext, $allowedExts)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid image format. Allowed formats: JPG, PNG, WEBP, GIF."]);
        exit;
    }
    
    $uploadDir = __DIR__ . "/../../uploads/";
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }
    
    $newFileName = "item_" . time() . "_" . bin2hex(random_bytes(4)) . "." . $ext;
    $destPath = $uploadDir . $newFileName;
    
    if (move_uploaded_file($fileTmpPath, $destPath)) {
        $image_path = "uploads/" . $newFileName;
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to save uploaded image."]);
        exit;
    }
}

$status = "active";

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
