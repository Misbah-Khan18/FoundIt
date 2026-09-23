<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/RateLimiter.php');
require_once('../../services/EmailService.php');

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
$email = strtolower(trim($data["email"] ?? ""));

if ($email === "" || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please provide a valid email address."
    ]);
    exit;
}

// 1. Rate Limiting Protection (Max 3 password reset requests per 15 minutes per IP and email)
$clientIp = RateLimiter::getClientIp();
$ipKey = "forgot:ip:" . $clientIp;
$emailKey = "forgot:email:" . hash('sha256', $email);

$ipCheck = RateLimiter::check($conn, $ipKey, 3, 900, 900);
if (!$ipCheck['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many password reset requests from this network. Please wait " . ceil($ipCheck['retry_after'] / 60) . " minutes before trying again."
    ]);
    $conn->close();
    exit;
}

$emailCheck = RateLimiter::check($conn, $emailKey, 3, 900, 900);
if (!$emailCheck['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many password reset requests for this account. Please wait " . ceil($emailCheck['retry_after'] / 60) . " minutes before trying again."
    ]);
    $conn->close();
    exit;
}

// Record attempt for rate tracking
RateLimiter::recordFailure($conn, $ipKey, 3, 900, 900);
RateLimiter::recordFailure($conn, $emailKey, 3, 900, 900);

// 2. Query user from database
$stmt = $conn->prepare("SELECT id, name FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$resetToken = null;
$resetLink = null;
$mailSent = false;

if ($result->num_rows > 0) {
    $userRow = $result->fetch_assoc();
    $userName = $userRow["name"] ?? "Student";

    // Generate cryptographically secure 32-byte token
    $rawToken = bin2hex(random_bytes(32));
    $tokenHash = hash('sha256', $rawToken);
    
    // Invalidate old tokens for this email
    $delStmt = $conn->prepare("DELETE FROM password_resets WHERE email = ?");
    $delStmt->bind_param("s", $email);
    $delStmt->execute();
    $delStmt->close();
    
    // Store token hash with 1 hour expiration
    $insStmt = $conn->prepare(
        "INSERT INTO password_resets (email, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))"
    );
    $insStmt->bind_param("ss", $email, $tokenHash);
    $insStmt->execute();
    $insStmt->close();

    $resetToken = $rawToken;

    // Construct reset link based on client origin or local fallback
    $origin = !empty($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'http://localhost:5173';
    $resetLink = rtrim($origin, '/') . '/reset-password?token=' . urlencode($rawToken);

    // Send email using EmailService
    try {
        $mailSent = EmailService::sendPasswordResetEmail($email, $userName, $resetLink);
    } catch (\Throwable $e) {
        error_log("Password reset email dispatch error: " . $e->getMessage());
        $mailSent = false;
    }
}

$stmt->close();
$conn->close();

// Always return generic success message to prevent user enumeration
$response = [
    "success" => true,
    "message" => "If an account with that email exists, password reset instructions have been generated.",
    "mail_sent" => $mailSent
];

// In local development mode, if explicitly enabled and SMTP is offline, provide dev notice
$isDevDebug = (getenv('APP_ENV') === 'development' || getenv('APP_DEBUG') === 'true');
if ($isDevDebug && !$mailSent && $resetToken !== null) {
    $response["dev_reset_token"] = $resetToken;
    $response["dev_reset_link"] = $resetLink;
    $response["dev_notice"] = "SMTP is not configured in .env. Configure SMTP_HOST in .env to send real emails to your inbox, or use the quick access link below to proceed.";
}

echo json_encode($response);
