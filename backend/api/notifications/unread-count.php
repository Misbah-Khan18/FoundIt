<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];

$stmt = $conn->prepare("SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = ? AND is_read = FALSE");
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
