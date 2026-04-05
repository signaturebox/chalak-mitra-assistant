<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['ticket_id']) || !isset($input['reply'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit();
        }
        
        $ticketId = $input['ticket_id'];
        $reply = $input['reply'];
        // Accept 'sender_name' or 'admin_name' (legacy), default to 'Admin'
        $senderName = isset($input['sender_name']) ? $input['sender_name'] : (isset($input['admin_name']) ? $input['admin_name'] : 'Admin');
        
        // Ensure ticket_replies table exists
        $db->exec("CREATE TABLE IF NOT EXISTS ticket_replies (
            id INT AUTO_INCREMENT PRIMARY KEY,
            ticket_id INT NOT NULL,
            sender_name VARCHAR(100) NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
        )");
        
        $stmt = $db->prepare("INSERT INTO ticket_replies (ticket_id, sender_name, message) VALUES (?, ?, ?)");
        $stmt->execute([$ticketId, $senderName, $reply]);
        
        // Update ticket updated_at timestamp to bring it to top
        // Update notification flags
        $isAdmin = (strpos(strtolower($senderName), 'admin') !== false);
        $lastReplyBy = $isAdmin ? 'admin' : 'user';
        $isReadByUser = $isAdmin ? 0 : 1;
        $isReadByAdmin = $isAdmin ? 1 : 0;
        
        $db->prepare("UPDATE support_tickets SET updated_at = CURRENT_TIMESTAMP, last_reply_by = ?, is_read_by_user = ?, is_read_by_admin = ? WHERE id = ?")
           ->execute([$lastReplyBy, $isReadByUser, $isReadByAdmin, $ticketId]);
        
        echo json_encode(['success' => true, 'message' => 'Reply sent successfully']);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>