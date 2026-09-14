<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');

$type = isset($_GET["type"]) ? trim($_GET["type"]) : "";

if ($type !== "" && in_array($type, ["lost", "found"])) {
    $stmt = $conn->prepare(
        "SELECT i.id, i.user_id, i.type, i.title, i.description, i.category, i.location, i.item_date as date, i.image, i.status, i.created_at, u.name as reporter
         FROM items i
         JOIN users u ON i.user_id = u.id
         WHERE i.type = ?
         ORDER BY i.created_at DESC"
    );
    $stmt->bind_param("s", $type);
    $stmt->execute();
    $result = $stmt->get_result();
} else {
    $result = $conn->query(
        "SELECT i.id, i.user_id, i.type, i.title, i.description, i.category, i.location, i.item_date as date, i.image, i.status, i.created_at, u.name as reporter
         FROM items i
         JOIN users u ON i.user_id = u.id
         ORDER BY i.created_at DESC"
    );
}

$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = $row;
}

echo json_encode([
    "success" => true,
    "items" => $items
]);

$conn->close();

?>
