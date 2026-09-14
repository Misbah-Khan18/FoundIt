<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/NotificationService.php');

// 1. Strict Server-Side Session Authentication
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required. Please log in to file a claim."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];

// 2. Parse & Validate Input
$data = json_decode(file_get_contents("php://input"), true);
$item_id = (int)($data["item_id"] ?? 0);
$message = trim($data["message"] ?? "");

if ($item_id <= 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Valid item ID is required."
    ]);
    exit;
}

if ($message === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Verification details or proof of ownership is required."
    ]);
    exit;
}

// 3. Verify item exists & check status & type
$itemCheck = $conn->prepare("SELECT id, user_id, type, title, status FROM items WHERE id = ?");
$itemCheck->bind_param("i", $item_id);
$itemCheck->execute();
$itemRes = $itemCheck->get_result();

if ($itemRes->num_rows === 0) {
    http_response_code(404);
    echo json_encode([
        "success" => false,
        "message" => "The item you are trying to claim does not exist."
    ]);
    $itemCheck->close();
    $conn->close();
    exit;
}

$itemInfo = $itemRes->fetch_assoc();
$itemCheck->close();

// 4. Verify item type is FOUND
if ($itemInfo["type"] !== "found") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Claims can only be filed on Found items."
    ]);
    $conn->close();
    exit;
}

// 5. Check if item is currently claimable
if ($itemInfo["status"] === "claimed" || $itemInfo["status"] === "resolved") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "This item has already been claimed or resolved."
    ]);
    $conn->close();
    exit;
}

// 6. Prevent claiming own reported item
if ((int)$itemInfo["user_id"] === $user_id) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "You cannot file a claim on an item that you reported yourself."
    ]);
    $conn->close();
    exit;
}

// 7. Check duplicate active claims from the same claimant for the same item
$dupCheck = $conn->prepare("SELECT id FROM claims WHERE item_id = ? AND claimant_id = ? AND status != 'rejected'");
$dupCheck->bind_param("ii", $item_id, $user_id);
$dupCheck->execute();
$dupRes = $dupCheck->get_result();

if ($dupRes->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "You have already submitted an active claim for this item. Please await administrator review."
    ]);
    $dupCheck->close();
    $conn->close();
    exit;
}
$dupCheck->close();

// 8. Insert claim record
$stmt = $conn->prepare("INSERT INTO claims (item_id, claimant_id, message, status) VALUES (?, ?, ?, 'pending')");
$stmt->bind_param("iis", $item_id, $user_id, $message);

if ($stmt->execute()) {
    $claim_id = $stmt->insert_id;

    // Fetch claimant name
    $cStmt = $conn->prepare("SELECT name FROM users WHERE id = ?");
    $cStmt->bind_param("i", $user_id);
    $cStmt->execute();
    $cRes = $cStmt->get_result()->fetch_assoc();
    $claimantName = $cRes["name"] ?? "A student";
    $cStmt->close();

    $itemTitle = $itemInfo["title"] ?? "Found Item";
    $reporterId = (int)$itemInfo["user_id"];

    // 1. Notify item reporter
    if ($reporterId > 0) {
        NotificationService::create(
            $conn,
            $reporterId,
            "New Claim Filed for " . $itemTitle,
            $claimantName . " has submitted an ownership claim for your reported found item (" . $itemTitle . ").",
            "claim_submitted",
            $item_id,
            $claim_id,
            true,
            [
                "claimantName" => $claimantName,
                "itemTitle" => $itemTitle
            ]
        );
    }

    // 2. Notify system admins about pending claim
    $adminRes = $conn->query("SELECT id FROM users WHERE role = 'admin'");
    if ($adminRes) {
        while ($adminRow = $adminRes->fetch_assoc()) {
            $adminId = (int)$adminRow["id"];
            if ($adminId !== $reporterId) {
                NotificationService::create(
                    $conn,
                    $adminId,
                    "Pending Claim Submitted for " . $itemTitle,
                    $claimantName . " submitted a new claim for " . $itemTitle . " awaiting admin review.",
                    "claim_submitted",
                    $item_id,
                    $claim_id,
                    false
                );
            }
        }
    }

    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Your ownership claim has been submitted successfully and is pending administrator review.",
        "claim_id" => $claim_id
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to submit claim request: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();

?>
