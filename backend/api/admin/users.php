<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

// GET: Fetch all users with report counts, status, and campus details
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT u.id, u.name, u.email, u.phone_number, u.role, u.roll_number, u.stream, u.status, u.created_at,
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
                "roll_number" => $row["roll_number"] ?? null,
                "stream" => $row["stream"] ?? null,
                "reports" => (int)$row["reports_count"],
                "status" => $row["status"] ?? "active",
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

// POST: Update user role or account status (active/suspended)
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    validateCsrfToken($data);
    $targetUserId = (int)($data["user_id"] ?? 0);
    $newRole = isset($data["role"]) ? trim($data["role"]) : null;
    $newStatus = isset($data["status"]) ? trim($data["status"]) : null;

    if ($targetUserId <= 0) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Valid user ID is required."
        ]);
        exit;
    }

    // Validate parameters
    if ($newRole !== null && !in_array($newRole, ["student", "admin"])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Role must be either 'student' or 'admin'."
        ]);
        exit;
    }

    if ($newStatus !== null && !in_array($newStatus, ["active", "suspended"])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Status must be either 'active' or 'suspended'."
        ]);
        exit;
    }

    if ($newRole === null && $newStatus === null) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Either 'role' or 'status' must be provided to update."
        ]);
        exit;
    }

    // Check target user existence
    $checkStmt = $conn->prepare("SELECT id, name, role, status FROM users WHERE id = ?");
    $checkStmt->bind_param("i", $targetUserId);
    $checkStmt->execute();
    $targetUser = $checkStmt->get_result()->fetch_assoc();
    $checkStmt->close();

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Target user account was not found."
        ]);
        exit;
    }

    // Guardrail: Cannot suspend your own account
    if ($targetUserId === (int)$_SESSION["user_id"] && $newStatus === "suspended") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "You cannot suspend your own logged-in administrator account."
        ]);
        exit;
    }

    // Guardrail: Do not accidentally suspend administrators
    if ($targetUser["role"] === "admin" && $newStatus === "suspended") {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Administrator accounts cannot be suspended directly. Demote the user first if necessary."
        ]);
        exit;
    }

    // Perform updates
    $updates = [];
    $types = "";
    $params = [];

    if ($newRole !== null) {
        $updates[] = "role = ?";
        $types .= "s";
        $params[] = $newRole;
    }

    if ($newStatus !== null) {
        $updates[] = "status = ?";
        $types .= "s";
        $params[] = $newStatus;
    }

    $types .= "i";
    $params[] = $targetUserId;

    $sql = "UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param($types, ...$params);

    if ($stmt->execute()) {
        $msg = "User updated successfully.";
        if ($newStatus !== null && $newRole === null) {
            $msg = $newStatus === "suspended"
                ? "User account has been suspended."
                : "User account has been reactivated.";
        } elseif ($newRole !== null && $newStatus === null) {
            $msg = "User role updated to " . strtoupper($newRole) . ".";
        }

        echo json_encode([
            "success" => true,
            "message" => $msg
        ]);
    } else {
        error_log("Update user error: " . $conn->error);
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update user account. Please try again."
        ]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);

?>
