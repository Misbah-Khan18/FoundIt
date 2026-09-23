<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

$authenticatedUser = requireAuth($conn);
$user_id = (int)$authenticatedUser["id"];

$isStudent = (($authenticatedUser["role"] ?? "student") === "student");

if ($isStudent) {
    $stmt = $conn->prepare(
        "SELECT COUNT(*) as unread_count 
         FROM notifications 
         WHERE user_id = ? 
           AND is_read = FALSE
           AND type NOT IN ('report_created')
           AND title NOT LIKE 'Report Submitted%'
           AND title NOT LIKE 'Claim Submitted%'
           AND title NOT LIKE 'New % Report%'
           AND title NOT LIKE 'Pending Claim%'"
    );
} else {
    $stmt = $conn->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE");
}
$stmt->bind_param("i", $user_id);
$stmt->execute();
$res = $stmt->get_result()->fetch_assoc();
$unread_count = (int)($res["unread_count"] ?? 0);

echo json_encode([
    "success" => true,
    "unread_count" => $unread_count
]);

$stmt->close();
$conn->close();

?>
