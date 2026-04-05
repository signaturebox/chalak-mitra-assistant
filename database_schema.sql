-- NWR Chalak Mitra Database Schema
-- MySQL 5.7+ compatible

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

-- Create database
CREATE DATABASE IF NOT EXISTS `nwr_chalak_mitra` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `nwr_chalak_mitra`;

-- Table: users (for crew members, admins, etc.)
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cms_id` varchar(50) NOT NULL UNIQUE,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mobile` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('crew', 'lobby', 'division', 'super') NOT NULL DEFAULT 'crew',
  `division` enum('jaipur', 'ajmer', 'jodhpur', 'bikaner') NOT NULL,
  `lobby` varchar(100) DEFAULT NULL,
  `designation` varchar(10) DEFAULT NULL COMMENT 'LPG, LPM, LPP, ALP, SALP, TM',
  `profile_image` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cms_id` (`cms_id`),
  KEY `idx_role` (`role`),
  KEY `idx_division` (`division`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: divisions
CREATE TABLE `divisions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `code` varchar(10) NOT NULL UNIQUE,
  `description` text,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default divisions
INSERT INTO `divisions` (`name`, `code`, `description`) VALUES
('Jaipur', 'jaipur', 'Jaipur Division'),
('Ajmer', 'ajmer', 'Ajmer Division'),
('Jodhpur', 'jodhpur', 'Jodhpur Division'),
('Bikaner', 'bikaner', 'Bikaner Division');

-- Table: lobbies
CREATE TABLE `lobbies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `division_id` int(11) NOT NULL,
  `code` varchar(20) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_division_code` (`division_id`, `code`),
  CONSTRAINT `fk_lobby_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default lobbies
INSERT INTO `lobbies` (`name`, `division_id`, `code`) VALUES
('BKN - Bikaner Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'BKN'),
('BNW - Bhavani Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'BNW'),
('CUR - Churu', (SELECT id FROM divisions WHERE code = 'bikaner'), 'CUR'),
('HSR - Hisar Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'HSR'),
('HMH - Hanumangarh Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'HMH'),
('LGH - Lalgarh Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'LGH'),
('RE - Rewari Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'RE'),
('SOG - Suratgarh Jn.', (SELECT id FROM divisions WHERE code = 'bikaner'), 'SOG'),
('SGNR - Shri Ganganagar', (SELECT id FROM divisions WHERE code = 'bikaner'), 'SGNR'),
('ABR - Abu Road', (SELECT id FROM divisions WHERE code = 'ajmer'), 'ABR'),
('AII - Ajmer Jn.', (SELECT id FROM divisions WHERE code = 'ajmer'), 'AII'),
('MJ - Marwar Jn.', (SELECT id FROM divisions WHERE code = 'ajmer'), 'MJ'),
('UDZ - Udaipur City', (SELECT id FROM divisions WHERE code = 'ajmer'), 'UDZ'),
('BGKT - Bhagat Ki Kothi', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'BGKT'),
('BME - Barmer', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'BME'),
('JU - Jodhpur Jn.', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'JU'),
('JSM - Jaisalmer', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'JSM'),
('MTD - Merta Road', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'MTD'),
('SMR - Samdari', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'SMR'),
('SONU - Sonu', (SELECT id FROM divisions WHERE code = 'jodhpur'), 'SONU'),
('AELN - New Ateli Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'AELN'),
('BKI - Bandukui Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'BKI'),
('FL - Phulera Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'FL'),
('FLN - New Phulera Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'FLN'),
('JP - Jaipur Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'JP'),
('RE - Rewari JP Jn.', (SELECT id FROM divisions WHERE code = 'jaipur'), 'RE');

-- Table: fault_database
CREATE TABLE `fault_database` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('electric', 'diesel', 'vb') NOT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(255) NOT NULL,
  `loco` varchar(50) NOT NULL,
  `symptom` text NOT NULL,
  `fix` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_fault_code` (`code`, `loco`),
  KEY `idx_type` (`type`),
  KEY `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample fault data
INSERT INTO `fault_database` (`type`, `code`, `title`, `loco`, `symptom`, `fix`) VALUES
('electric', '361', 'Main Inverter Fault', 'WAP-7', 'No traction, inverter alarm', 'Check inverter cubicle; inspect SCR modules; verify cooling; reset isolator; check for overheating.'),
('electric', '362', 'Traction Motor Fault', 'WAP-7', 'Reduced power, motor overheating', 'Check motor bearings; inspect carbon brushes; verify motor connections; check for foreign objects.'),
('electric', '201', 'Pantograph Failure', 'WAP-5', 'No power, pantograph down', 'Check pantograph air pressure; inspect pantograph springs; verify circuit breaker; check OHE contact.'),
('diesel', 'D101', 'Engine Start Failure', 'WDP-4', 'Engine won\'t start', 'Check battery voltage; verify fuel supply; inspect starter motor; check governor settings.'),
('vb', 'VB01', 'Door Control Fault', 'Vande Bharat', 'Doors not closing properly', 'Check door motor; verify door controller; inspect sensors; reset door control system.'),
('vb', 'VB02', 'HVAC System Fault', 'Vande Bharat', 'Air conditioning failure', 'Check compressor; verify refrigerant levels; inspect electrical connections; reset HVAC control.');

-- Table: question_bank
CREATE TABLE `question_bank` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category` enum('mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block') NOT NULL,
  `question` text NOT NULL,
  `option_1` varchar(255) NOT NULL,
  `option_2` varchar(255) NOT NULL,
  `option_3` varchar(255) NOT NULL,
  `option_4` varchar(255) NOT NULL,
  `correct_answer` tinyint(1) NOT NULL COMMENT '0-3 representing the correct option index',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_category` (`category`),
  CONSTRAINT `fk_question_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample questions
INSERT INTO `question_bank` (`category`, `question`, `option_1`, `option_2`, `option_3`, `option_4`, `correct_answer`) VALUES
('mixed', 'What is the main purpose of automatic signaling?', 'Automate ticketing', 'Control train separation and safety', 'Speed up trains', 'Track maintenance', 1),
('mixed', 'SPAD stands for?', 'Signal Passing At Danger', 'Signal Passing Above Danger', 'Safe Passing At Depot', 'Speed Passing At Distance', 0),
('mixed', 'Track circuits are used to detect:', 'Track occupancy', 'Train speed', 'Weather conditions', 'Signal color', 0),
('mixed', 'First action on traction failure:', 'Replace motor immediately', 'Check main breaker and fuses', 'Call control office', 'Evacuate passengers', 1),
('mixed', 'Absolute block system requires clearance from:', 'Signalman only', 'Station Master', 'Guard', 'Loco Pilot', 1),
('spad', 'RHS signal stands for:', 'Right Hand Side', 'Remote Hand Signal', 'Railway Halt Signal', 'Ready Hand Signal', 0),
('mixed', 'If track circuit fails, you should:', 'Report and protect the section', 'Ignore and proceed', 'Speed up to clear section', 'Stop the train permanently', 0),
('mixed', 'Approach light indicates:', 'Stop immediately', 'Prepare to slow down', 'Speed up', 'Proceed with caution', 1),
('loco', 'When brake pipe pressure is low, check:', 'Headlamp brightness', 'Brake cylinder and air dryer', 'Horn functionality', 'Windshield wipers', 1),
('loco', 'Compressor health is indicated by:', 'Ammeter readings', 'Air pressure gauge', 'Speedometer', 'Temperature gauge', 1),
('loco', 'For traction fault, first check:', 'Horn system', 'Main breaker and fuses', 'Windshield wipers', 'Headlights', 1),
('mixed', 'Double yellow signal means:', 'Stop', 'Proceed with caution', 'Clear', 'Prepare to stop at next signal', 3);

-- Table: quiz_attempts
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `quiz_topic` enum('mixed', 'spad', 'rhs', 'loco') NOT NULL,
  `total_questions` tinyint(2) NOT NULL DEFAULT 10,
  `correct_answers` tinyint(2) NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `quiz_data` JSON DEFAULT NULL COMMENT 'Stores the questions and answers attempted',
  `certificate_id` varchar(50) DEFAULT NULL,
  `is_passed` tinyint(1) NOT NULL DEFAULT 0,
  `attempted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_attempted_at` (`attempted_at`),
  KEY `idx_certificate_id` (`certificate_id`),
  CONSTRAINT `fk_quiz_attempt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: certificates
CREATE TABLE `certificates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `certificate_id` varchar(50) NOT NULL UNIQUE,
  `user_id` int(11) NOT NULL,
  `quiz_attempt_id` int(11) NOT NULL,
  `division` enum('jaipur', 'ajmer', 'jodhpur', 'bikaner') NOT NULL,
  `lobby` varchar(100) DEFAULT NULL,
  `score` decimal(5,2) NOT NULL,
  `qr_code_data` text,
  `certificate_pdf_path` varchar(255) DEFAULT NULL,
  `issued_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cert_id` (`certificate_id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_quiz_attempt` (`quiz_attempt_id`),
  CONSTRAINT `fk_certificate_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_certificate_quiz` FOREIGN KEY (`quiz_attempt_id`) REFERENCES `quiz_attempts` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: files
CREATE TABLE `files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `original_name` LONGTEXT NOT NULL COMMENT 'Stores JSON content for message/html types',
  `title` varchar(255) DEFAULT NULL COMMENT 'User-friendly display title',
  `file_path` LONGTEXT NOT NULL COMMENT 'File path or JSON content',
  `file_type` varchar(50) NOT NULL,
  `file_size` int(11) NOT NULL,
  `division_id` int(11) DEFAULT NULL,
  `lobby_id` int(11) DEFAULT NULL,
  `section` varchar(100) DEFAULT NULL COMMENT 'DRM Instructions, Safety Circular, etc.',
  `uploaded_by` int(11) NOT NULL,
  `description` text,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `uploaded_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_division` (`division_id`),
  KEY `idx_lobby` (`lobby_id`),
  KEY `idx_uploaded_by` (`uploaded_by`),
  CONSTRAINT `fk_file_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_file_lobby` FOREIGN KEY (`lobby_id`) REFERENCES `lobbies` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_file_uploaded_by` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: support_tickets
CREATE TABLE `support_tickets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `category` enum('technical', 'quiz', 'certificate', 'account', 'content', 'other') NOT NULL,
  `priority` enum('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `assigned_to` int(11) DEFAULT NULL,
  `status` enum('open', 'in_progress', 'resolved', 'closed') NOT NULL DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_priority` (`priority`),
  CONSTRAINT `fk_ticket_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_ticket_assigned_to` FOREIGN KEY (`assigned_to`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: notifications
CREATE TABLE `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info', 'warning', 'success', 'error', 'announcement') NOT NULL DEFAULT 'info',
  `target_role` enum('all', 'crew', 'lobby', 'division', 'super') NOT NULL DEFAULT 'all',
  `target_division_id` int(11) DEFAULT NULL,
  `target_lobby_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_by` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_target_role` (`target_role`),
  KEY `idx_active` (`is_active`),
  CONSTRAINT `fk_notification_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_notification_division` FOREIGN KEY (`target_division_id`) REFERENCES `divisions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_notification_lobby` FOREIGN KEY (`target_lobby_id`) REFERENCES `lobbies` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: user_notifications
CREATE TABLE `user_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `notification_id` int(11) NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_notification` (`user_id`, `notification_id`),
  KEY `idx_is_read` (`is_read`),
  CONSTRAINT `fk_user_notification_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: system_settings
CREATE TABLE `system_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL UNIQUE,
  `setting_value` text,
  `description` varchar(255),
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_setting_key` (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default system settings
INSERT INTO `system_settings` (`setting_key`, `setting_value`, `description`) VALUES
('app_name', 'NWR Chalak Mitra', 'Application name'),
('app_version', '1.0.0', 'Application version'),
('quiz_questions_per_attempt', '10', 'Number of questions per quiz'),
('quiz_passing_score', '6', 'Minimum correct answers to pass quiz'),
('site_logo', NULL, 'Base64 encoded site logo'),
('last_data_update', NOW(), 'Timestamp of last data update');

-- Table: login_attempts
CREATE TABLE `login_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_identifier` varchar(100) NOT NULL COMMENT 'CMS ID, email, or username',
  `ip_address` varchar(45) NOT NULL,
  `success` tinyint(1) NOT NULL,
  `user_agent` text,
  `attempted_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_identifier` (`user_identifier`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_attempted_at` (`attempted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create indexes for better performance
CREATE INDEX idx_users_division_lobby ON users(division, lobby);
CREATE INDEX idx_faults_type_code ON fault_database(type, code);
CREATE INDEX idx_quiz_attempts_user_date ON quiz_attempts(user_id, attempted_at);
CREATE INDEX idx_files_section ON files(section);

-- Add requested super admin user (login: ritutechno.jpr@gmail.com, password: Ritu@5011)
INSERT INTO `users` (`cms_id`, `name`, `email`, `mobile`, `password_hash`, `role`, `division`, `lobby`, `designation`, `is_active`) 
VALUES ('SUPER001', 'Ritu Admin', 'ritutechno.jpr@gmail.com', '9460550511', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super', 'jaipur', 'JP - Jaipur Jn.', 'TM', 1); -- Note: Default hash for 'password', change to hash for 'Ritu@5011' when setting up

-- Insert sample crew user
INSERT INTO `users` (`cms_id`, `name`, `email`, `mobile`, `password_hash`, `role`, `division`, `lobby`, `designation`, `is_active`) 
VALUES ('CREW123', 'John Doe', 'john.doe@railway.com', '9876543210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'crew', 'jaipur', 'JP - Jaipur Jn.', 'LPG', 1);

-- Add some sample notifications
INSERT INTO `notifications` (`title`, `message`, `type`, `target_role`, `created_by`) VALUES
('Welcome to NWR Chalak Mitra', 'This is a sample notification for all users.', 'info', 'all', 1),
('New Quiz Available', 'A new quiz on SPAD prevention is now available for all crew members.', 'success', 'crew', 1),
('System Maintenance', 'Scheduled maintenance will occur on Sunday from 10 PM to 2 AM.', 'warning', 'all', 1);

COMMIT;