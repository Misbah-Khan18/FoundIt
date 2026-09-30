<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode(["success" => false, "message" => "Method not allowed."]);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true) ?: [];

$name = trim($data["name"] ?? "");
$email = trim($data["email"] ?? "");
$message = trim($data["message"] ?? "");
$rating = isset($data["rating"]) ? (int)$data["rating"] : 5;
if ($rating < 1 || $rating > 5) {
    $rating = 5;
}

if (empty($name) || empty($email) || empty($message)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please fill out all required fields."]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Please provide a valid email address."]);
    exit;
}

// Check if user is logged in
$userId = null;
if (isset($_SESSION["user_id"])) {
    $userId = (int)$_SESSION["user_id"];
}

$stmt = $conn->prepare("INSERT INTO feedback (user_id, name, email, message, rating, status) VALUES (?, ?, ?, ?, ?, 'pending')");
$stmt->bind_param("isssi", $userId, $name, $email, $message, $rating);

if ($stmt->execute()) {
    $feedbackId = $stmt->insert_id;
    echo json_encode([
        "success" => true,
        "message" => "Thank you for your feedback! Your message has been received.",
        "feedback_id" => $feedbackId
    ]);
} else {
    http_response_code(500);
    echo json_encode(["success" => false, "message" => "Failed to submit feedback. Please try again."]);
}

$stmt->close();
$conn->close();

