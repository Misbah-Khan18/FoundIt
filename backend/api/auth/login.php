<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/csrf.php');
require_once('../../services/RateLimiter.php');

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

// Get JSON data
$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);
    exit;
}

// Get email and password
$email = strtolower(trim($data["email"] ?? ""));
$password = $data["password"] ?? "";

// Validate fields
if ($email === "" || $password === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required."
    ]);
    exit;
}

// 1. Rate Limiting Protection (Max 5 failed attempts per 15 minutes per IP and email)
$clientIp = RateLimiter::getClientIp();
$ipKey = "login:ip:" . $clientIp;
$emailKey = "login:email:" . hash('sha256', $email);

$ipCheck = RateLimiter::check($conn, $ipKey, 5, 900, 900);
if (!$ipCheck['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many failed login attempts from this network. Please wait " . ceil($ipCheck['retry_after'] / 60) . " minutes before trying again."
    ]);
    $conn->close();
    exit;
}

$emailCheck = RateLimiter::check($conn, $emailKey, 5, 900, 900);
if (!$emailCheck['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many failed login attempts for this account. Please wait " . ceil($emailCheck['retry_after'] / 60) . " minutes before trying again."
    ]);
    $conn->close();
    exit;
}

// 2. Query user from database
$stmt = $conn->prepare(
    "SELECT id, name, email, phone_number, password, role, roll_number, stream, status
     FROM users
     WHERE email = ?"
);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    // Record failed attempt to throttle enumeration
    RateLimiter::recordFailure($conn, $ipKey, 5, 900, 900);
    RateLimiter::recordFailure($conn, $emailKey, 5, 900, 900);
    $stmt->close();
    $conn->close();

    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}

$user = $result->fetch_assoc();
$stmt->close();

// 3. Strict Cryptographic Password Verification (No hardcoded backdoors)
if (empty($user["password"]) || !password_verify($password, $user["password"])) {
    RateLimiter::recordFailure($conn, $ipKey, 5, 900, 900);
    RateLimiter::recordFailure($conn, $emailKey, 5, 900, 900);
    $conn->close();

    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Invalid email or password."
    ]);
    exit;
}

// 4. Enforce Account Suspension Status
if (($user["status"] ?? "active") === "suspended") {
    $conn->close();
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Your account has been suspended by campus administration. Please contact the helpdesk."
    ]);
    exit;
}

// 5. Successful Authentication: Reset rate limiter counters
RateLimiter::reset($conn, $ipKey);
RateLimiter::reset($conn, $emailKey);

// 6. Regenerate Session ID to Prevent Session Fixation Attacks
session_regenerate_id(true);

// 7. Store Session Variables
$_SESSION["user_id"] = (int)$user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["phone_number"] = $user["phone_number"] ?? "";
$_SESSION["role"] = $user["role"];
$_SESSION["status"] = $user["status"] ?? "active";
$_SESSION["roll_number"] = $user["roll_number"] ?? "";
$_SESSION["stream"] = $user["stream"] ?? "";

// 8. Generate CSRF token for the authenticated session
$csrfToken = getCsrfToken();

// Remove password before sending user data to client
unset($user["password"]);
$user["id"] = (int)$user["id"];

echo json_encode([
    "success" => true,
    "message" => "Login successful.",
    "csrf_token" => $csrfToken,
    "user" => $user
]);

$conn->close();
