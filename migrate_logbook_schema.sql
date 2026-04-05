-- Create user_logbooks table if it doesn't exist
CREATE TABLE IF NOT EXISTS `user_logbooks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `cms_id` varchar(50) DEFAULT NULL,
  `entry_date` date DEFAULT NULL,
  `train_no` varchar(50) DEFAULT NULL,
  `loco_no` varchar(50) DEFAULT NULL,
  `from_station` varchar(100) DEFAULT NULL,
  `to_station` varchar(100) DEFAULT NULL,
  `sign_on` varchar(20) DEFAULT NULL,
  `sign_off` varchar(20) DEFAULT NULL,
  `log_data` JSON DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_cms_id` (`cms_id`),
  KEY `idx_entry_date` (`entry_date`),
  CONSTRAINT `fk_logbook_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add columns to quiz_attempts if they don't exist (using a stored procedure or just simple ALTER statements that might fail if exist, but safe to ignore error in some contexts, or use a block)
-- MySQL 5.7 doesn't support IF NOT EXISTS for columns easily.
-- We will try to add them. If they fail, it means they exist (or other error).

DROP PROCEDURE IF EXISTS UpgradeQuizAttempts;

DELIMITER $$
CREATE PROCEDURE UpgradeQuizAttempts()
BEGIN
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quiz_attempts' AND COLUMN_NAME = 'cms_id') THEN
        ALTER TABLE quiz_attempts ADD COLUMN cms_id VARCHAR(50) NULL AFTER user_id;
    END IF;
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quiz_attempts' AND COLUMN_NAME = 'crew_name') THEN
        ALTER TABLE quiz_attempts ADD COLUMN crew_name VARCHAR(255) NULL AFTER cms_id;
    END IF;
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quiz_attempts' AND COLUMN_NAME = 'division') THEN
        ALTER TABLE quiz_attempts ADD COLUMN division ENUM('jaipur', 'ajmer', 'jodhpur', 'bikaner') NULL AFTER crew_name;
    END IF;
    IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'quiz_attempts' AND COLUMN_NAME = 'lobby') THEN
        ALTER TABLE quiz_attempts ADD COLUMN lobby VARCHAR(100) NULL AFTER division;
    END IF;
END $$
DELIMITER ;

CALL UpgradeQuizAttempts();
DROP PROCEDURE UpgradeQuizAttempts;
