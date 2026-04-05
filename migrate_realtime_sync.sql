-- Migration for Real-time Synchronization Features
-- Run this SQL to add required tables for the new features

-- Table to track file updates for real-time sync
CREATE TABLE IF NOT EXISTS file_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_id INT,
  action ENUM('upload', 'delete', 'edit') NOT NULL,
  target_division_id INT,
  target_lobby_id INT,
  target_section VARCHAR(100),
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created_at (created_at),
  INDEX idx_targets (target_division_id, target_lobby_id, target_section),
  CONSTRAINT fk_file_updates_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL,
  CONSTRAINT fk_file_updates_division FOREIGN KEY (target_division_id) REFERENCES divisions(id) ON DELETE SET NULL,
  CONSTRAINT fk_file_updates_lobby FOREIGN KEY (target_lobby_id) REFERENCES lobbies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to track file views for "New" badges
CREATE TABLE IF NOT EXISTS file_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  file_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_file (user_id, file_id),
  INDEX idx_user_viewed (user_id, viewed_at),
  CONSTRAINT fk_file_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_file_views_file FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for notification counters cache
CREATE TABLE IF NOT EXISTS notification_counters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  division_count INT DEFAULT 0,
  lobby_count INT DEFAULT 0,
  tab_count INT DEFAULT 0,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user (user_id),
  CONSTRAINT fk_counters_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table for scheduled popup messages
CREATE TABLE IF NOT EXISTS popup_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT NOT NULL,
  content_type ENUM('text', 'html') DEFAULT 'text',
  start_datetime DATETIME NOT NULL,
  end_datetime DATETIME NOT NULL,
  target_role ENUM('all', 'crew', 'lobby', 'division', 'super') DEFAULT 'all',
  target_division_id INT,
  target_lobby_id INT,
  is_active TINYINT(1) DEFAULT 1,
  show_once TINYINT(1) DEFAULT 1,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_active_dates (is_active, start_datetime, end_datetime),
  INDEX idx_targets (target_division_id, target_lobby_id),
  CONSTRAINT fk_popup_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_popup_division FOREIGN KEY (target_division_id) REFERENCES divisions(id) ON DELETE SET NULL,
  CONSTRAINT fk_popup_lobby FOREIGN KEY (target_lobby_id) REFERENCES lobbies(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table to track which users have seen which popups
CREATE TABLE IF NOT EXISTS popup_views (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  popup_id INT NOT NULL,
  viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_popup (user_id, popup_id),
  CONSTRAINT fk_popup_views_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_popup_views_popup FOREIGN KEY (popup_id) REFERENCES popup_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_files_uploaded_at ON files(uploaded_at);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_file_updates_created_at ON file_updates(created_at);

-- Add 'is_new' tracking column to files (for 24-hour "New" badge)
ALTER TABLE files ADD COLUMN IF NOT EXISTS is_highlighted TINYINT(1) DEFAULT 0;

-- Success message
SELECT 'Migration completed successfully. Tables created: file_updates, file_views, notification_counters, popup_messages, popup_views' AS message;
