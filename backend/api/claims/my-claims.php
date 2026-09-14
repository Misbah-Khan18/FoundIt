<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

// 1. Strict Server-Side Session Authentication
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];

// 2. Fetch all claims filed by the logged-in student
$stmt = $conn->prepare(
    "SELECT c.id, c.item_id, c.claimant_id, c.message, c.status, c.created_at,
            i.title as item_title, i.type as item_type, i.category as item_category,
            i.location as item_location, i.item_date as date, i.image as item_image,
            i.status as item_status
     FROM claims c
     JOIN items i ON c.item_id = i.id
     WHERE c.claimant_id = ?
     ORDER BY c.created_at DESC"
);

$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$claims = [];
while ($row = $result->fetch_assoc()) {
    $claims[] = [
        "id" => (int)$row["id"],
        "item_id" => (int)$row["item_id"],
        "item_title" => $row["item_title"],
        "item_type" => $row["item_type"],
        "item_category" => $row["item_category"] ?? "General",
        "item_location" => $row["item_location"] ?? "Campus",
        "item_image" => $row["item_image"] ?? null,
        "item_status" => $row["item_status"],
        "message" => $row["message"],
        "status" => $row["status"],
        "created_at" => $row["created_at"]
    ];
}

echo json_encode([
    "success" => true,
    "claims" => $claims
]);

$stmt->close();
$conn->close();

?>
