<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$token = trim($data["token"] ?? "");
$password = $data["password"] ?? "";

if ($token === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Reset token and new password are required."
    ]);
    exit;
}

if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "New password must be at least 6 characters long."
    ]);
    exit;
}

// Compute token hash
$tokenHash = hash('sha256', $token);

// Look up active token
$stmt = $conn->prepare(
    "SELECT email, expires_at 
     FROM password_resets 
     WHERE token_hash = ? AND expires_at > NOW()"
);
$stmt->bind_param("s", $tokenHash);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "This password reset link is invalid or has expired."
    ]);
    $stmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();
$email = $row["email"];
$stmt->close();

// Update password in users table
$newHash = password_hash($password, PASSWORD_DEFAULT);
$updateStmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
$updateStmt->bind_param("ss", $newHash, $email);

if ($updateStmt->execute()) {
    // Delete used token
    $delStmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
    $delStmt->bind_param("s", $email);
    $delStmt->execute();
    $delStmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Your password has been reset successfully. Please log in with your new credentials."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to update password. Please try again."
    ]);
}

$updateStmt->close();
$conn->close();

?>
