<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['ticket_id']) || !isset($input['status'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit();
        }
        
        $stmt = $db->prepare("UPDATE support_tickets SET status = ? WHERE id = ?");
        $stmt->execute([$input['status'], $input['ticket_id']]);
        
        echo json_encode(['success' => true, 'message' => 'Ticket status updated']);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>