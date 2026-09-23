<?php

/**
 * FoundIt - Admin Seeding Utility
 * 
 * SECURITY: Restricted to CLI execution only. Cannot be executed via public web requests.
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    header("Content-Type: application/json");
    echo json_encode([
        "success" => false,
        "message" => "Forbidden: Admin seeding utility is strictly restricted to command-line execution."
    ]);
    exit;
}

require_once(__DIR__ . '/../../config/database.php');

$adminName = "Campus Administrator";
$adminEmail = "admin@mitwpu.edu.in";
$adminPhone = "+919876543210";
$adminPasswordPlain = getenv('ADMIN_SEED_PASSWORD') ?: "Admin@1234";
$adminPasswordHash = password_hash($adminPasswordPlain, PASSWORD_DEFAULT);
$adminRole = "admin";

// Check if admin user already exists
$stmt = $conn->prepare("SELECT id, email, role FROM users WHERE email = ?");
$stmt->bind_param("s", $adminEmail);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows > 0) {
    $row = $res->fetch_assoc();
    $updateStmt = $conn->prepare("UPDATE users SET password = ?, role = 'admin', status = 'active', name = ? WHERE id = ?");
    $updateStmt->bind_param("ssi", $adminPasswordHash, $adminName, $row["id"]);
    $updateStmt->execute();
    $updateStmt->close();

    echo "Admin user credentials refreshed successfully (ID: {$row['id']}).\n";
} else {
    $insStmt = $conn->prepare("INSERT INTO users (name, email, phone_number, password, role, status) VALUES (?, ?, ?, ?, ?, 'active')");
    $insStmt->bind_param("sssss", $adminName, $adminEmail, $adminPhone, $adminPasswordHash, $adminRole);
    if ($insStmt->execute()) {
        echo "Default administrator user created successfully (ID: {$insStmt->insert_id}).\n";
    } else {
        echo "Failed to create administrator user: " . $conn->error . "\n";
    }
    $insStmt->close();
}

$stmt->close();
$conn->close();
