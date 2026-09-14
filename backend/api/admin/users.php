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

// GET: Fetch all users with report counts
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT u.id, u.name, u.email, u.phone_number, u.role, u.created_at,
                   COUNT(i.id) as reports_count
            FROM users u
            LEFT JOIN items i ON u.id = i.user_id
            GROUP BY u.id
            ORDER BY u.created_at DESC";

    $result = $conn->query($sql);
    $users = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $users[] = [
                "id" => (int)$row["id"],
                "name" => $row["name"],
                "email" => $row["email"],
                "phone_number" => $row["phone_number"] ?? "",
                "role" => $row["role"],
                "reports" => (int)$row["reports_count"],
                "status" => "active", // default active status
                "created_at" => $row["created_at"]
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "users" => $users
    ]);
    $conn->close();
    exit;
}

// POST: Update user role or manage account
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $targetUserId = (int)($data["user_id"] ?? 0);
    $newRole = trim($data["role"] ?? "");

    if ($targetUserId <= 0 || !in_array($newRole, ["student", "admin"])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid parameters for user role update."
        ]);
        exit;
    }

    $stmt = $conn->prepare("UPDATE users SET role = ? WHERE id = ?");
    $stmt->bind_param("si", $newRole, $targetUserId);
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "User role updated successfully."
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update user."
        ]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);

?>
