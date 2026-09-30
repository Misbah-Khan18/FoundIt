<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

$adminId = requireAdmin($conn);

// GET: Fetch all feedback items
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT f.id, f.user_id, f.name, f.email, f.message, f.rating, f.status, f.created_at, f.updated_at,
                   u.name as registered_user_name, u.role as registered_user_role
            FROM feedback f
            LEFT JOIN users u ON f.user_id = u.id
            ORDER BY f.created_at DESC";
    $result = $conn->query($sql);
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "id" => (int)$row["id"],
                "user_id" => $row["user_id"] ? (int)$row["user_id"] : null,
                "name" => $row["name"],
                "email" => $row["email"],
                "message" => $row["message"],
                "rating" => (int)$row["rating"],
                "status" => $row["status"],
                "created_at" => $row["created_at"],
                "updated_at" => $row["updated_at"],
                "registered_user_name" => $row["registered_user_name"],
                "registered_user_role" => $row["registered_user_role"],
            ];
        }
    }
    echo json_encode(["success" => true, "feedback" => $items]);
    $conn->close();
    exit;
}

// POST: Update feedback status (reviewed, resolved)
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true) ?: [];
    validateCsrfToken($data);

    $feedbackId = (int)($data["feedback_id"] ?? $data["id"] ?? 0);
    $newStatus = trim($data["status"] ?? "");

    $validStatuses = ["pending", "reviewed", "resolved"];
    if ($feedbackId <= 0 || !in_array($newStatus, $validStatuses, true)) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Invalid feedback ID or status."]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE feedback SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $newStatus, $feedbackId);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Feedback marked as " . $newStatus]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to update feedback status."]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

// DELETE: Remove feedback entry
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true) ?: [];
    validateCsrfToken($data);

    $feedbackId = (int)($data["feedback_id"] ?? $data["id"] ?? $_GET["id"] ?? 0);
    if ($feedbackId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid feedback ID required."]);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM feedback WHERE id = ?");
    $stmt->bind_param("i", $feedbackId);
    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Feedback deleted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete feedback."]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);

