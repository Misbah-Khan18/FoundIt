USE foundit_db;

-- 1. Default Administrator (Password: Admin@1234)
INSERT INTO users (id, name, email, phone_number, password, role)
VALUES (
    1,
    'Campus Administrator',
    'admin@mitwpu.edu.in',
    '+919876543210',
    '$2y$10$H2cH6XvO8.yS8EhMKzY5KOl/22aasygvH06PK3PiDy/MCkf8Xddm2', -- Admin@1234
    'admin'
)
ON DUPLICATE KEY UPDATE 
    role = 'admin',
    password = VALUES(password);

-- 2. Sample Students (Password: Password@123)
INSERT INTO users (id, name, email, phone_number, password, role)
VALUES 
    (2, 'Aarav Mehta', 'aarav.mehta@mitwpu.edu.in', '9876543211', '$2y$10$mxh/BJ0N.Qze3tCdF3i1AOPbEAURkBreCts/cu7HQRCeKj84aZJPa', 'student'),
    (3, 'Riya Sharma', 'riya.sharma@mitwpu.edu.in', '9876543212', '$2y$10$mxh/BJ0N.Qze3tCdF3i1AOPbEAURkBreCts/cu7HQRCeKj84aZJPa', 'student'),
    (4, 'Vikram Patil', 'vikram.patil@mitwpu.edu.in', '9876543213', '$2y$10$mxh/BJ0N.Qze3tCdF3i1AOPbEAURkBreCts/cu7HQRCeKj84aZJPa', 'student')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. Sample Items
INSERT INTO items (id, user_id, type, title, description, category, location, item_date, status)
VALUES
    (1, 2, 'lost', 'Apple AirPods Pro (2nd Gen)', 'White case with a small scratch near the hinge. Lost near library 3rd floor reading room.', 'Electronics', 'Central Library', '2026-08-20', 'active'),
    (2, 3, 'found', 'Blue Hydro Flask 32oz', 'Navy blue insulated water bottle found in Room 402 desk area.', 'Accessories', 'Chanakya Building', '2026-08-21', 'under_review'),
    (3, 4, 'lost', 'Scientific Calculator (Casio fx-991CW)', 'Black calculator with student name sticker on back cover.', 'Academics', 'Engineering Workshop', '2026-08-22', 'matched'),
    (4, 2, 'found', 'Leather RFID Wallet', 'Brown leather wallet containing MIT-WPU library pass and bus smartcard.', 'Personal Items', 'Student Cafeteria', '2026-08-23', 'resolved')
ON DUPLICATE KEY UPDATE title=VALUES(title);
