<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing user_id']);
            exit();
        }
        
        $stmt = $db->prepare("SELECT * FROM support_tickets WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$user_id]);
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
