-- Migration: Notification System V2
-- Hierarchical counters for Division -> Lobby -> Tab
-- Date: 2026-02-18

-- Table: file_views
-- Tracks which files have been viewed by which users
-- This enables the "New" badge functionality
CREATE TABLE IF NOT EXISTS file_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_file_view (user_id, file_id),
    KEY idx_user_id (user_id),
    KEY idx_file_id (file_id),
    KEY idx_viewed_at (viewed_at),
    CONSTRAINT fk_file_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_views_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notification_counters
-- Caches counter values for quick retrieval
CREATE TABLE IF NOT EXISTS notification_counters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    division_count INT DEFAULT 0,
    lobby_count INT DEFAULT 0,
    tab_count INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_user_id (user_id),
    KEY idx_last_updated (last_updated),
    CONSTRAINT fk_notification_counters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: file_updates (for real-time sync)
-- Tracks file changes for real-time notifications
CREATE TABLE IF NOT EXISTS file_updates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    action ENUM('upload', 'delete', 'update') NOT NULL DEFAULT 'upload',
    target_division_id INT DEFAULT NULL,
    target_lobby_id INT DEFAULT NULL,
    target_section VARCHAR(100) DEFAULT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    KEY idx_file_id (file_id),
    KEY idx_action (action),
    KEY idx_created_at (created_at),
    KEY idx_target_division (target_division_id),
    KEY idx_target_lobby (target_lobby_id),
    CONSTRAINT fk_file_updates_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_updates_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_file_updates_division FOREIGN KEY (target_division_id) REFERENCES divisions(id) ON DELETE SET NULL,
    CONSTRAINT fk_file_updates_lobby FOREIGN KEY (target_lobby_id) REFERENCES lobbies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Note: Indexes for performance optimization
-- The following indexes are recommended but may already exist:
-- - idx_uploaded_at on files(uploaded_at)
-- - idx_is_active on files(is_active)
-- - idx_section on files(section)
-- - idx_division_uploaded on files(division_id, uploaded_at)
-- - idx_lobby_uploaded on files(lobby_id, uploaded_at)
-- - idx_section_uploaded on files(section, uploaded_at)
-- - idx_created_at on notifications(created_at)
-- - idx_active_created on notifications(is_active, created_at)
-- - idx_user_read on user_notifications(user_id, is_read)
-- 
-- If any of these indexes don't exist, you can create them manually:
-- ALTER TABLE files ADD INDEX idx_uploaded_at (uploaded_at);

-- Insert sample data for testing (optional)
-- Uncomment the following lines to add test data

-- INSERT INTO file_views (user_id, file_id, viewed_at) 
-- SELECT u.id, f.id, NOW() 
-- FROM users u, files f 
-- WHERE u.role = 'crew' 
-- LIMIT 10;

-- Verify tables were created
SELECT 'file_views table created' AS status;
SELECT 'notification_counters table created' AS status;
SELECT 'file_updates table created' AS status;
