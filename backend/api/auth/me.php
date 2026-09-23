<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/csrf.php');

// Check whether someone is logged in
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);
    exit;
}

$userId = (int)$_SESSION["user_id"];

// Always verify real-time status and information against database
$stmt = $conn->prepare("SELECT id, name, email, phone_number, role, roll_number, stream, status FROM users WHERE id = ?");
$stmt->bind_param("i", $userId);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    session_unset();
    session_destroy();
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Account not found or deleted."
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$user = $res->fetch_assoc();
$stmt->close();
$conn->close();

// Enforce account suspension immediately
if (($user["status"] ?? "active") === "suspended") {
    session_unset();
    session_destroy();
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Your account has been suspended by campus administration. Please contact the helpdesk."
    ]);
    exit;
}

// Update session with latest DB values
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["phone_number"] = $user["phone_number"] ?? "";
$_SESSION["role"] = $user["role"];
$_SESSION["status"] = $user["status"];
$_SESSION["roll_number"] = $user["roll_number"] ?? "";
$_SESSION["stream"] = $user["stream"] ?? "";

echo json_encode([
    "success" => true,
    "csrf_token" => getCsrfToken(),
    "user" => [
        "id" => (int)$user["id"],
        "name" => $user["name"],
        "email" => $user["email"],
        "phone_number" => $user["phone_number"] ?? "",
        "role" => $user["role"],
        "roll_number" => $user["roll_number"] ?? null,
        "stream" => $user["stream"] ?? null,
        "status" => $user["status"] ?? "active"
    ]
]);

?>
