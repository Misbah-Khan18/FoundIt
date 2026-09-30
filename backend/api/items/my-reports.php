<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

$authenticatedUser = requireAuth($conn);
$user_id = (int)$authenticatedUser["id"];

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
    $row["id"] = (int)$row["id"];
    $row["user_id"] = (int)$row["user_id"];
    $items[] = $row;
}

echo json_encode([
    "success" => true,
    "items" => $items
]);

$stmt->close();
$conn->close();

?>
