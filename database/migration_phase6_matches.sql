-- Phase 6 Migration: Create matches table for Lost ↔ Found Smart Matching Engine

USE foundit_db;

CREATE TABLE IF NOT EXISTS matches (
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
);

-- Performance Indexes for Matching Engine queries
CREATE INDEX idx_items_type_status ON items(type, status);
CREATE INDEX idx_items_category ON items(category);
CREATE INDEX idx_items_location ON items(location);
CREATE INDEX idx_matches_overall_score ON matches(overall_score);
CREATE INDEX idx_matches_status ON matches(status);
