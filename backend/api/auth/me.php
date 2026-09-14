<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");

// Check whether someone is logged in
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Not logged in."
    ]);
    exit;
}

// Return current logged-in user from session
echo json_encode([
    "success" => true,
    "user" => [
        "id" => (int)$_SESSION["user_id"],
        "name" => $_SESSION["name"],
        "email" => $_SESSION["email"],
        "phone_number" => $_SESSION["phone_number"] ?? "",
        "role" => $_SESSION["role"]
    ]
]);

?>
