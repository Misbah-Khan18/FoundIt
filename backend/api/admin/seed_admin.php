<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');

// Admin credentials to seed
$adminName = "Campus Administrator";
$adminEmail = "admin@mitwpu.edu.in";
$adminPhone = "+919876543210";
$adminPasswordPlain = "Admin@1234";
$adminPasswordHash = password_hash($adminPasswordPlain, PASSWORD_DEFAULT);
$adminRole = "admin";

// Check if admin user already exists
$stmt = $conn->prepare("SELECT id, email, role FROM users WHERE email = ?");
$stmt->bind_param("s", $adminEmail);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    // Update existing user to ensure admin role and password
    $row = $res->fetch_assoc();
    $updateStmt = $conn->prepare("UPDATE users SET password = ?, role = 'admin', name = ? WHERE id = ?");
    $updateStmt->bind_param("ssi", $adminPasswordHash, $adminName, $row["id"]);
    $updateStmt->execute();
    $updateStmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Admin user credentials updated successfully.",
        "credentials" => [
            "email" => $adminEmail,
            "password" => $adminPasswordPlain,
            "role" => "admin",
            "dashboard_url" => "/admin"
        ]
    ]);
} else {
    // Insert new admin user
    $insStmt = $conn->prepare("INSERT INTO users (name, email, phone_number, password, role) VALUES (?, ?, ?, ?, ?)");
    $insStmt->bind_param("sssss", $adminName, $adminEmail, $adminPhone, $adminPasswordHash, $adminRole);
    if ($insStmt->execute()) {
        echo json_encode([
            "success" => true,
            "message" => "Default admin user created successfully.",
            "credentials" => [
                "email" => $adminEmail,
                "password" => $adminPasswordPlain,
                "role" => "admin",
                "dashboard_url" => "/admin"
            ]
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to create admin user: " . $conn->error
        ]);
    }
    $insStmt->close();
}

$stmt->close();
$conn->close();

?>
