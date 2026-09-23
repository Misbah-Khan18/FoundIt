-- Phase 1 Critical Migration
-- 1. Create password_resets table if not exists
USE foundit_db;

CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(150) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (email),
    INDEX (token_hash)
);

-- 2. Add roll_number and stream to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS roll_number VARCHAR(50) NULL AFTER phone_number;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stream VARCHAR(100) NULL AFTER roll_number;

-- 3. Add status to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS status ENUM('active', 'suspended') DEFAULT 'active' AFTER role;
