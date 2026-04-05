<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        $popup_id = $data['popup_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
        
        if (!$popup_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Popup ID is required']);
            exit();
        }
        
        // Increment total_views in popup_messages
        $stmt = $db->prepare("UPDATE popup_messages SET total_views = total_views + 1 WHERE id = ?");
        $stmt->execute([$popup_id]);
        
        // Also record in popup_views if user_id is provided (for show_once tracking)
        if ($user_id) {
            // Convert user_id if it's CMS ID
            if (!is_numeric($user_id)) {
                $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                if ($userData) {
                    $user_id = $userData['id'];
                }
            }
            
            if (is_numeric($user_id)) {
                $viewStmt = $db->prepare("INSERT IGNORE INTO popup_views (user_id, popup_id, viewed_at) VALUES (?, ?, NOW())");
                $viewStmt->execute([$user_id, $popup_id]);
            }
        }
        
        echo json_encode(['success' => true]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
