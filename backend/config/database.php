<?php

$host = "localhost";
$dbname = "foundit_db";
$username = "root";
$password = "";

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

$conn->set_charset("utf8mb4");

// Ensure database tables and columns are up to date (auto-migration check)
$phoneCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'phone_number'");
if ($phoneCheck && $phoneCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL UNIQUE AFTER email");
}

$colCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'firebase_uid'");
if ($colCheck && $colCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE NULL AFTER role");
    $conn->query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER firebase_uid");
    $conn->query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL");
}

// Phase 6 Matches table auto-migration check
$matchTableCheck = $conn->query("SHOW TABLES LIKE 'matches'");
if ($matchTableCheck && $matchTableCheck->num_rows === 0) {
    $conn->query("CREATE TABLE matches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lost_item_id INT NOT NULL,
        found_item_id INT NOT NULL,
        description_score DECIMAL(5,2) DEFAULT 0.00,
        image_score DECIMAL(5,2) DEFAULT 0.00,
        location_score DECIMAL(5,2) DEFAULT 0.00,
        date_score DECIMAL(5,2) DEFAULT 0.00,
        overall_score DECIMAL(5,2) DEFAULT 0.00,
        confidence_level ENUM('HIGH', 'MEDIUM', 'LOW', 'VERY_LOW') DEFAULT 'LOW',
        status ENUM('pending', 'reviewed', 'confirmed', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_matches_lost FOREIGN KEY (lost_item_id) REFERENCES items(id) ON DELETE CASCADE,
        CONSTRAINT fk_matches_found FOREIGN KEY (found_item_id) REFERENCES items(id) ON DELETE CASCADE,
        CONSTRAINT unique_match_pair UNIQUE (lost_item_id, found_item_id)
    )");
}

?>
