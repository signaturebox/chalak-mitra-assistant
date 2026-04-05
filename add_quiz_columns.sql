-- Add columns to quiz_attempts table to store crew details separately from user record
ALTER TABLE quiz_attempts 
ADD COLUMN cms_id VARCHAR(50) NULL AFTER user_id,
ADD COLUMN crew_name VARCHAR(255) NULL AFTER cms_id,
ADD COLUMN division ENUM('jaipur', 'ajmer', 'jodhpur', 'bikaner') NULL AFTER crew_name,
ADD COLUMN lobby VARCHAR(100) NULL AFTER division;

-- Update existing records to populate the new columns from the users table
UPDATE quiz_attempts qa
JOIN users u ON qa.user_id = u.id
SET 
    qa.cms_id = u.cms_id,
    qa.crew_name = u.name,
    qa.division = u.division,
    qa.lobby = u.lobby
WHERE qa.cms_id IS NULL;