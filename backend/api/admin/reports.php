<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

// Strict server-side role check
if (!isset($_SESSION["user_id"]) || ($_SESSION["role"] ?? "") !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Forbidden: Administrator privileges required."
    ]);
    exit;
}

// GET: Fetch all reports for admin moderation
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT i.id, i.user_id, i.type, i.title, i.category, i.location,
                   i.item_date as date, i.image, i.status, i.created_at,
                   u.name as reporter, u.email as reporter_email
            FROM items i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC";

    $result = $conn->query($sql);
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = $row;
        }
    }

    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    $conn->close();
    exit;
}

// POST: Update report status
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $itemId = (int)($data["item_id"] ?? 0);
    $newStatus = trim($data["status"] ?? "");

    $validStatuses = ["active", "under_review", "matched", "claimed", "resolved"];
    if ($itemId <= 0 || !in_array($newStatus, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid status update parameters."
        ]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE items SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $newStatus, $itemId);
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Report status updated to " . $newStatus
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update item status."
        ]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);

?>
