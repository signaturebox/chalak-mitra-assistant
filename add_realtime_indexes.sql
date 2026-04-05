-- Add composite index for optimized differential fetch
-- This allows MySQL to instantly find new files by section and ID

-- Check if index exists and drop it if necessary
ALTER TABLE files DROP INDEX IF EXISTS idx_section_id;

-- Create optimized composite index
ALTER TABLE files ADD INDEX idx_section_id (section, id);

-- Additional index for uploaded_at for "NEW" badge detection
ALTER TABLE files ADD INDEX idx_uploaded_at (uploaded_at);

-- Optimize the table after adding indexes
OPTIMIZE TABLE files;

-- Show index information
SHOW INDEX FROM files;
