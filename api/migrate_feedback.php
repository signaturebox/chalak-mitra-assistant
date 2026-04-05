<?php
require_once 'config/db_config.php';

header('Content-Type: text/plain');

try {
    $db = getDBConnection();
    
    // Create feedback table if it doesn't exist
    $db->exec("CREATE TABLE IF NOT EXISTS `feedback` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `user_id` int(11) NOT NULL,
      `category` varchar(100) NOT NULL,
      `rating` int(11) NOT NULL CHECK (`rating` >= 1 AND `rating` <= 5),
      `message` text DEFAULT NULL,
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_user_id` (`user_id`),
      CONSTRAINT `fk_feedback_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "✅ Table 'feedback' created or already exists.\n";

    // Create support_tickets table if it doesn't exist (for good measure)
    $db->exec("CREATE TABLE IF NOT EXISTS `support_tickets` (
      `id` int(11) NOT NULL AUTO_INCREMENT,
      `user_id` int(11) NOT NULL,
      `subject` varchar(255) NOT NULL,
      `message` text NOT NULL,
      `status` enum('open','closed','pending') DEFAULT 'open',
      `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (`id`),
      KEY `idx_user_id` (`user_id`),
      CONSTRAINT `fk_ticket_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    
    echo "✅ Table 'support_tickets' created or already exists.\n";
    
} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
    http_response_code(500);
}
?>
