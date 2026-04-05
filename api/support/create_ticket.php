<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
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
    } catch (Exception $e) {
        // Ignore error if column check fails, try to proceed
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['subject']) || !isset($input['message'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit();
        }
        
        $stmt = $db->prepare("INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)");
        $stmt->execute([$input['user_id'], $input['subject'], $input['message']]);
        
        echo json_encode(['success' => true, 'message' => 'Ticket created successfully', 'id' => $db->lastInsertId()]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
