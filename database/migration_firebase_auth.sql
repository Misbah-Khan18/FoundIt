-- Migration: Add Firebase Authentication support to MySQL users table
USE foundit_db;

-- 1. Add firebase_uid and profile_image columns if they don't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE NULL AFTER role;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) NULL AFTER firebase_uid;

-- 2. Make password column nullable so OAuth/Google users do not require a dummy password
ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL;
