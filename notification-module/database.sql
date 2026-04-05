--
-- Notification Module Database Schema
-- Run this SQL to create required tables
--

-- Table: file_views
-- Tracks which files each user has viewed
-- Used to show/hide "New" badges
CREATE TABLE IF NOT EXISTS file_views (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    file_id INT NOT NULL,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate views
    UNIQUE KEY unique_user_file_view (user_id, file_id),
    
    -- Indexes for performance
    KEY idx_user_id (user_id),
    KEY idx_file_id (file_id),
    KEY idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: push_subscriptions
-- Stores web push notification subscriptions for each user
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    endpoint VARCHAR(500) NOT NULL,
    p256dh VARCHAR(255) NOT NULL,
    auth VARCHAR(255) NOT NULL,
    division VARCHAR(100),
    lobby VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Unique constraint on endpoint
    UNIQUE KEY unique_endpoint (endpoint),
    
    -- Indexes for performance
    KEY idx_user_id (user_id),
    KEY idx_division (division),
    KEY idx_lobby (lobby)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications (optional - for in-app notifications)
-- Stores notification messages
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
    target_division_id INT,
    target_lobby_id INT,
    target_user_id INT,
    file_id INT,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Indexes
    KEY idx_target_division (target_division_id),
    KEY idx_target_lobby (target_lobby_id),
    KEY idx_target_user (target_user_id),
    KEY idx_file_id (file_id),
    KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_notifications
-- Tracks which notifications each user has read
CREATE TABLE IF NOT EXISTS user_notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    notification_id INT NOT NULL,
    is_read TINYINT(1) DEFAULT 0,
    read_at TIMESTAMP NULL,
    
    -- Unique constraint
    UNIQUE KEY unique_user_notification (user_id, notification_id),
    
    -- Indexes
    KEY idx_user_id (user_id),
    KEY idx_notification_id (notification_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes to existing files table for better performance
-- (Run only if these indexes don't already exist)
ALTER TABLE files 
ADD INDEX IF NOT EXISTS idx_uploaded_at (uploaded_at),
ADD INDEX IF NOT EXISTS idx_division_uploaded (division_id, uploaded_at),
ADD INDEX IF NOT EXISTS idx_lobby_uploaded (lobby_id, uploaded_at),
ADD INDEX IF NOT EXISTS idx_section (section);

-- Add indexes to existing users table
ALTER TABLE users 
ADD INDEX IF NOT EXISTS idx_division (division),
ADD INDEX IF NOT EXISTS idx_lobby (lobby);

-- Add indexes to existing divisions table
ALTER TABLE divisions 
ADD INDEX IF NOT EXISTS idx_code (code);

-- Add indexes to existing lobbies table
ALTER TABLE lobbies 
ADD INDEX IF NOT EXISTS idx_name (name),
ADD INDEX IF NOT EXISTS idx_code (code);
