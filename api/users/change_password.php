<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['current_password']) || !isset($input['new_password'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing required fields']);
            exit();
        }
        
        $user_id = $input['user_id'];
        $current_password = $input['current_password'];
        $new_password = $input['new_password'];
        
        // Fetch current password hash
        $stmt = $db->prepare("SELECT password FROM users WHERE id = ?");
        $stmt->execute([$user_id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'User not found']);
            exit();
        }
        
        // Verify current password
        if (!password_verify($current_password, $user['password'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Incorrect current password']);
            exit();
        }
        
        // Hash new password
        $new_hash = password_hash($new_password, PASSWORD_DEFAULT);
        
        // Update password
        $updateStmt = $db->prepare("UPDATE users SET password = ? WHERE id = ?");
        $updateStmt->execute([$new_hash, $user_id]);
        
        echo json_encode(['success' => true, 'message' => 'Password changed successfully']);
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
