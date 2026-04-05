-- Migration for Real-time Sync v2
-- Creates tables needed for instant file synchronization

-- Table to track file views (for removing "New" tag)
CREATE TABLE IF NOT EXISTS file_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    user_id VARCHAR(50) NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_view (file_id, user_id),
    INDEX idx_file_id (file_id),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Table to track file deletions for real-time sync
CREATE TABLE IF NOT EXISTS file_deletions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    file_id INT NOT NULL,
    deleted_by VARCHAR(50) NOT NULL,
    deleted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    division_id VARCHAR(50),
    lobby_id VARCHAR(50),
    section VARCHAR(100),
    INDEX idx_deleted_at (deleted_at),
    INDEX idx_file_id (file_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add trigger to automatically track file deletions
DELIMITER //

CREATE TRIGGER IF NOT EXISTS trg_file_deletion
AFTER DELETE ON files
FOR EACH ROW
BEGIN
    INSERT INTO file_deletions (file_id, deleted_by, deleted_at, division_id, lobby_id, section)
    VALUES (OLD.id, OLD.uploaded_by, NOW(), OLD.division_id, OLD.lobby_id, OLD.section);
END//

DELIMITER ;

-- Ensure files table has is_deleted column for soft delete support
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0;
ALTER TABLE files ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Add index for faster real-time queries
ALTER TABLE files ADD INDEX IF NOT EXISTS idx_created_at (created_at);
ALTER TABLE files ADD INDEX IF NOT EXISTS idx_updated_at (updated_at);
ALTER TABLE files ADD INDEX IF NOT EXISTS idx_is_deleted (is_deleted);
