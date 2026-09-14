<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];

$stmt = $conn->prepare(
    "SELECT id, user_id, type, title, description, category, location, item_date as date, image, status, created_at
     FROM items
     WHERE user_id = ?
     ORDER BY created_at DESC"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    "success" => true,
    "items" => $items
]);

$stmt->close();
$conn->close();

?>
