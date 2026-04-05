<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $ticket_id = $_GET['ticket_id'] ?? null;
        $viewer_role = $_GET['viewer_role'] ?? null; // 'admin' or 'user'
        
        if (!$ticket_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing ticket_id']);
            exit();
        }
        
        // Fetch ticket details
        $stmt = $db->prepare("
            SELECT t.*, u.name as user_name, u.cms_id as user_cms, u.division, u.lobby, u.email as user_email
            FROM support_tickets t
            LEFT JOIN users u ON t.user_id = u.id
            WHERE t.id = ?
        ");
        $stmt->execute([$ticket_id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$ticket) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Ticket not found']);
            exit();
        }
        
        // Mark as read based on viewer role
        if ($viewer_role === 'admin') {
            $db->prepare("UPDATE support_tickets SET is_read_by_admin = 1 WHERE id = ?")->execute([$ticket_id]);
        } elseif ($viewer_role === 'user') {
            $db->prepare("UPDATE support_tickets SET is_read_by_user = 1 WHERE id = ?")->execute([$ticket_id]);
        }
        
        // Fetch replies
        $stmt = $db->prepare("SELECT * FROM ticket_replies WHERE ticket_id = ? ORDER BY created_at ASC");
        $stmt->execute([$ticket_id]);
        $replies = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true, 
            'ticket' => $ticket,
            'replies' => $replies
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>