<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Create support_tickets table if not exists
        $db->exec("CREATE TABLE IF NOT EXISTS support_tickets (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            status ENUM('open', 'closed', 'pending') DEFAULT 'open',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )");

        // Ensure 'message' column exists (migration for existing tables)
        try {
            $stmt = $db->query("SHOW COLUMNS FROM support_tickets LIKE 'message'");
            if ($stmt->rowCount() == 0) {
                $db->exec("ALTER TABLE support_tickets ADD COLUMN message TEXT NOT NULL");
            }
            
            // Add notification columns if they don't exist
            $stmt = $db->query("SHOW COLUMNS FROM support_tickets LIKE 'last_reply_by'");
            if ($stmt->rowCount() == 0) {
                $db->exec("ALTER TABLE support_tickets ADD COLUMN last_reply_by ENUM('user', 'admin') DEFAULT 'user'");
                $db->exec("ALTER TABLE support_tickets ADD COLUMN is_read_by_user TINYINT(1) DEFAULT 1");
                $db->exec("ALTER TABLE support_tickets ADD COLUMN is_read_by_admin TINYINT(1) DEFAULT 0");
            }
        } catch (Exception $e) {
            // Ignore error
        }

        // Fetch all tickets with user details
        $sql = "
            SELECT t.*, u.name as user_name, u.cms_id as user_cms, u.division, u.lobby 
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            ORDER BY t.updated_at DESC, t.created_at DESC
        ";
        
        $stmt = $db->query($sql);
        $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['success' => true, 'tickets' => $tickets]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>