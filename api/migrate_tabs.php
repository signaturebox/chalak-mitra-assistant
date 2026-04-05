<?php
require_once 'config/db_config.php';

try {
    $pdo = getDBConnection();
    
    // Create navigation_tabs table
    $sql = "CREATE TABLE IF NOT EXISTS `navigation_tabs` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `tab_id` varchar(100) NOT NULL UNIQUE,
      `name` varchar(100) NOT NULL,
      `type` enum('main', 'division', 'lobby') NOT NULL,
      `division_id` int(11) DEFAULT NULL,
      `lobby_id` int(11) DEFAULT NULL,
      `icon` varchar(255) DEFAULT NULL,
      `color` varchar(50) DEFAULT NULL,
      `order_index` int(11) NOT NULL DEFAULT 0,
      `is_active` tinyint(1) NOT NULL DEFAULT 1,
      `created_by` int(11) DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_type` (`type`),
      KEY `idx_division` (`division_id`),
      KEY `idx_lobby` (`lobby_id`),
      CONSTRAINT `fk_tab_division` FOREIGN KEY (`division_id`) REFERENCES `divisions` (`id`) ON DELETE CASCADE,
      CONSTRAINT `fk_tab_lobby` FOREIGN KEY (`lobby_id`) REFERENCES `lobbies` (`id`) ON DELETE CASCADE,
      CONSTRAINT `fk_tab_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);
    echo "Table 'navigation_tabs' created successfully.\n";
    
    // Add columns to files table if they don't exist (to link files to tabs more reliably)
    // For now we rely on 'section' column matching 'name'
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
