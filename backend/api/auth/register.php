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

// Get JSON data sent by React
$data = json_decode(file_get_contents("php://input"), true);

// Check whether data was received
if (!$data) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Invalid request data."
    ]);
    exit;
}

// Get form values
$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$phone_number = trim($data["phone_number"] ?? "");
$password = $data["password"] ?? "";

// Validate required fields
if ($name === "" || $email === "" || $password === "" || $phone_number === "") {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Name, email, phone number, and password are required."
    ]);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid email address."
    ]);
    exit;
}

// Validate phone number format (must strictly match standard Indian mobile phone format)
$cleanPhone = preg_replace('/[^\d+]/', '', $phone_number);
$isValidIndianMobile = preg_match('/^(?:\+91|91|0)?[6-9]\d{9}$/', $cleanPhone);

if (!$isValidIndianMobile) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Please enter a valid 10-digit mobile number (e.g., 9876543210 or +919876543210)."
    ]);
    exit;
}

// Check password length & strength
if (strlen($password) < 6) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Password must be at least 6 characters long."
    ]);
    exit;
}

// Check whether email already exists
$checkEmailStmt = $conn->prepare("SELECT id FROM users WHERE email = ?");
$checkEmailStmt->bind_param("s", $email);
$checkEmailStmt->execute();
$emailResult = $checkEmailStmt->get_result();

if ($emailResult->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "An account with this email already exists."
    ]);
    $checkEmailStmt->close();
    exit;
}
$checkEmailStmt->close();

// Check whether phone already exists
$checkPhoneStmt = $conn->prepare("SELECT id FROM users WHERE phone_number = ?");
$checkPhoneStmt->bind_param("s", $phone_number);
$checkPhoneStmt->execute();
$phoneResult = $checkPhoneStmt->get_result();

if ($phoneResult->num_rows > 0) {
    http_response_code(409);
    echo json_encode([
        "success" => false,
        "message" => "An account with this phone number already exists."
    ]);
    $checkPhoneStmt->close();
    exit;
}
$checkPhoneStmt->close();

// Hash the password securely
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Normal registrations MUST have role = 'student'
$role = "student";

$stmt = $conn->prepare(
    "INSERT INTO users (name, email, phone_number, password, role)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param("sssss", $name, $email, $phone_number, $hashedPassword, $role);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode([
        "success" => true,
        "message" => "Account created successfully. You can now log in."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Failed to create account: " . $conn->error
    ]);
}

$stmt->close();
$conn->close();

?>
