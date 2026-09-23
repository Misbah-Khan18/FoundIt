<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

$authenticatedUser = requireAuth($conn);
$user_id = (int)$authenticatedUser["id"];

$isStudent = (($authenticatedUser["role"] ?? "student") === "student");

if ($isStudent) {
    // Students strictly receive notifications regarding updates to their reports and claims.
    // Exclude redundant submission confirmations and administrative alerts.
    $stmt = $conn->prepare(
        "SELECT id, user_id, title, message, type, related_item_id, related_claim_id, is_read, created_at
         FROM notifications
         WHERE user_id = ?
           AND type NOT IN ('report_created')
           AND title NOT LIKE 'Report Submitted%'
           AND title NOT LIKE 'Claim Submitted%'
           AND title NOT LIKE 'New % Report%'
           AND title NOT LIKE 'Pending Claim%'
         ORDER BY created_at DESC"
    );
} else {
    $stmt = $conn->prepare(
        "SELECT id, user_id, title, message, type, related_item_id, related_claim_id, is_read, created_at
         FROM notifications
         WHERE user_id = ?
         ORDER BY created_at DESC"
    );
}

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$notifications = [];
$unread_count = 0;

while ($row = $result->fetch_assoc()) {
    $isRead = (bool)$row["is_read"];
    if (!$isRead) {
        $unread_count++;
    }
    $notifications[] = [
        "id" => (int)$row["id"],
        "user_id" => (int)$row["user_id"],
        "title" => $row["title"],
        "message" => $row["message"],
        "type" => $row["type"] ?? "general",
        "related_item_id" => $row["related_item_id"] ? (int)$row["related_item_id"] : null,
        "related_claim_id" => $row["related_claim_id"] ? (int)$row["related_claim_id"] : null,
        "is_read" => $isRead,
        "created_at" => $row["created_at"]
    ];
}

echo json_encode([
    "success" => true,
    "unread_count" => $unread_count,
    "notifications" => $notifications
]);

$stmt->close();
$conn->close();

?>
