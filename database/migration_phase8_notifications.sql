-- Migration Phase 8: Update Notifications Table
-- Safe and idempotent structure update.

USE foundit_db;

-- Add type column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = 'notifications';
SET @columnname = 'type';

SELECT COUNT(*) INTO @column_exists
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
AND TABLE_NAME = @tablename 
AND COLUMN_NAME = @columnname;

SET @query = IF(@column_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT \'general\' AFTER message;',
    'SELECT \'Column type already exists.\'');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add related_item_id column if it doesn't exist
SET @columnname = 'related_item_id';
SELECT COUNT(*) INTO @column_exists
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
AND TABLE_NAME = @tablename 
AND COLUMN_NAME = @columnname;

SET @query = IF(@column_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN related_item_id INT NULL AFTER type;',
    'SELECT \'Column related_item_id already exists.\'');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add related_claim_id column if it doesn't exist
SET @columnname = 'related_claim_id';
SELECT COUNT(*) INTO @column_exists
FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = @dbname 
AND TABLE_NAME = @tablename 
AND COLUMN_NAME = @columnname;

SET @query = IF(@column_exists = 0, 
    'ALTER TABLE notifications ADD COLUMN related_claim_id INT NULL AFTER related_item_id;',
    'SELECT \'Column related_claim_id already exists.\'');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- We don't strictly need FOREIGN KEY constraints for related_item_id or related_claim_id 
-- because they might refer to deleted items/claims (and we want to keep the notification history),
-- but we can add ON DELETE SET NULL if we want. For now, just making them NULLable INTs is sufficient and safe.
