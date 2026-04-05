<?php
require_once 'config/db_config.php';

header('Content-Type: text/plain');

try {
    $db = getDBConnection();
    
    $sqlFile = '../migrate_logbook_schema.sql';
    if (!file_exists($sqlFile)) {
        die("SQL file not found: $sqlFile");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split by delimiter if present, otherwise execute directly
    // Since we used DELIMITER $$, we need to handle stored procedures carefully or just execute them block by block.
    // However, PHP PDO doesn't support DELIMITER syntax directly.
    // It's better to rewrite the PHP script to execute the ALTER statements directly without stored procedure if possible,
    // or just run the CREATE TABLE part and then try ALTER separately.
    
    // Let's simplify the migration logic in PHP
    
    // 1. Create table user_logbooks
    $createTableSql = "CREATE TABLE IF NOT EXISTS `user_logbooks` (
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $db->exec($createTableSql);
    echo "✅ Table user_logbooks created or already exists.\n";
    
    // 2. Add columns to quiz_attempts (check if exist first)
    $columns = [
        'cms_id' => "VARCHAR(50) NULL AFTER user_id",
        'crew_name' => "VARCHAR(255) NULL AFTER cms_id",
        'division' => "ENUM('jaipur', 'ajmer', 'jodhpur', 'bikaner') NULL AFTER crew_name",
        'lobby' => "VARCHAR(100) NULL AFTER division"
    ];
    
    foreach ($columns as $col => $def) {
        $stmt = $db->query("SHOW COLUMNS FROM quiz_attempts LIKE '$col'");
        if ($stmt->rowCount() == 0) {
            $db->exec("ALTER TABLE quiz_attempts ADD COLUMN $col $def");
            echo "✅ Added column $col to quiz_attempts.\n";
        } else {
            echo "ℹ️ Column $col already exists in quiz_attempts.\n";
        }
    }
    
    echo "✅ Migration completed successfully.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    http_response_code(500);
}
?>
