-- Migration: Add image support to popup messages
-- Run this SQL to add image_url column for popup images

-- Add image_url column to popup_messages table
ALTER TABLE popup_messages 
ADD COLUMN IF NOT EXISTS image_url VARCHAR(500) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS image_position ENUM('top', 'bottom', 'background') DEFAULT 'top';

-- Add index for image lookups
CREATE INDEX IF NOT EXISTS idx_popup_images ON popup_messages(image_url);

-- Success message
SELECT 'Popup image support migration completed successfully.' AS message;
