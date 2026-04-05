-- Migration: Add title column to files table
-- Run this on your production database (u191706077_nwrchalak)

-- Add title column if it doesn't exist
ALTER TABLE `files` 
ADD COLUMN `title` VARCHAR(255) DEFAULT NULL 
COMMENT 'User-friendly display title' 
AFTER `original_name`;

-- Verify the change
DESCRIBE `files`;
