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
$email = trim($data["email"] ?? "");

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please provide a valid email address."
    ]);
    exit;
}

// Check if user exists
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$resetToken = null;

if ($result->num_rows > 0) {
    // Generate secure random token
    $rawToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $rawToken);
    
    // Invalidate old tokens for this email
    $delStmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
    $delStmt->bind_param("s", $email);
    $delStmt->execute();
    $delStmt->close();
    
    // Store token with 1 hour expiration
    $insStmt = $conn->prepare(
        "INSERT INTO password_resets (email, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))"
    );
    $insStmt->bind_param("ss", $email, $tokenHash);
    $insStmt->execute();
    $insStmt->close();

    $resetToken = $rawToken;
}

$stmt->close();
$conn->close();

// Always return generic success message to prevent user enumeration
$response = [
    "success" => true,
    "message" => "If an account with that email exists, password reset instructions have been generated."
];

// For local development environment (when email server is not configured):
if ($resetToken !== null && (isset($_SERVER['HTTP_HOST']) && strpos($_SERVER['HTTP_HOST'], 'localhost') !== false)) {
    $response["dev_reset_token"] = $resetToken;
}

echo json_encode($response);

?>
