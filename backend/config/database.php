<?php

// Check environment files for database configuration
$envFiles = [
    __DIR__ . '/../../.env',
    __DIR__ . '/../.env'
];
$dbEnv = [];
foreach ($envFiles as $envFile) {
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '' || strpos($trimmed, '#') === 0) continue;
            if (strpos($trimmed, '=') !== false) {
                list($name, $value) = explode('=', $trimmed, 2);
                $dbEnv[trim($name)] = trim($value);
            }
        }
        break;
    }
}

$host = !empty($dbEnv['DB_HOST']) ? $dbEnv['DB_HOST'] : (getenv('DB_HOST') ?: "localhost");
$dbname = !empty($dbEnv['DB_NAME']) ? $dbEnv['DB_NAME'] : (getenv('DB_NAME') ?: "foundit_db");
$username = !empty($dbEnv['DB_USER']) ? $dbEnv['DB_USER'] : (getenv('DB_USER') ?: "root");
$password = isset($dbEnv['DB_PASS']) ? $dbEnv['DB_PASS'] : (getenv('DB_PASS') !== false ? getenv('DB_PASS') : "");

$conn = new mysqli($host, $username, $password, $dbname);

if ($conn->connect_error) {
    error_log("Database connection failed: " . $conn->connect_error);
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Database connection failed. Please check database server configuration."
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

// Phase 1 Critical Auto-Migration: roll_number, stream, status, and password_resets
$rollCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'roll_number'");
if ($rollCheck && $rollCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN roll_number VARCHAR(50) NULL AFTER phone_number");
}

$streamCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'stream'");
if ($streamCheck && $streamCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN stream VARCHAR(100) NULL AFTER roll_number");
}

$statusCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'status'");
if ($statusCheck && $statusCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN status ENUM('active', 'suspended') DEFAULT 'active' AFTER role");
}

$pwdResetTableCheck = $conn->query("SHOW TABLES LIKE 'password_resets'");
if ($pwdResetTableCheck && $pwdResetTableCheck->num_rows === 0) {
    $conn->query("CREATE TABLE password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(150) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX (email),
        INDEX (token_hash)
    )");
}

$itemUpdatedCheck = $conn->query("SHOW COLUMNS FROM items LIKE 'updated_at'");
if ($itemUpdatedCheck && $itemUpdatedCheck->num_rows === 0) {
    $conn->query("ALTER TABLE items ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at");
}

// Phase 2 Security Auto-Migration: rate_limits table
$rateLimitsTableCheck = $conn->query("SHOW TABLES LIKE 'rate_limits'");
if ($rateLimitsTableCheck && $rateLimitsTableCheck->num_rows === 0) {
    $conn->query("CREATE TABLE rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_key VARCHAR(150) NOT NULL,
        attempts INT NOT NULL DEFAULT 1,
        last_attempt DATETIME NOT NULL,
        locked_until DATETIME NULL,
        UNIQUE KEY uk_action_key (action_key),
        INDEX idx_locked (locked_until),
        INDEX idx_last_attempt (last_attempt)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
}

?>
