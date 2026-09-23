-- Migration: Expand items.status to support all lifecycle stages
ALTER TABLE items MODIFY COLUMN status ENUM('active', 'under_review', 'pending', 'matched', 'claimed', 'resolved', 'rejected') DEFAULT 'active';
