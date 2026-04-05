<?php
/**
 * Update Popup Message API
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PUT') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $popup_id = $data['popup_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
        
        if (!$popup_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Popup ID is required']);
            exit();
        }
        
        // Check permissions
        if ($user_id) {
            if (!is_numeric($user_id)) {
                $userStmt = $db->prepare("SELECT id, role FROM users WHERE cms_id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                if ($userData) {
                    $user_id = $userData['id'];
                    $user_role = $userData['role'];
                }
            } else {
                $userStmt = $db->prepare("SELECT role FROM users WHERE id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                $user_role = $userData['role'] ?? null;
            }
            
            // Only super admin or creator can update
            if ($user_role !== 'super') {
                $checkStmt = $db->prepare("SELECT created_by FROM popup_messages WHERE id = ?");
                $checkStmt->execute([$popup_id]);
                $popup = $checkStmt->fetch();
                
                if (!$popup || $popup['created_by'] != $user_id) {
                    http_response_code(403);
                    echo json_encode(['error' => 'Permission denied']);
                    exit();
                }
            }
        }
        
        // Build update query dynamically
        $updates = [];
        $params = [];
        
        if (isset($data['title'])) {
            $updates[] = "title = ?";
            $params[] = $data['title'];
        }
        
        if (isset($data['content'])) {
            $updates[] = "content = ?";
            $params[] = $data['content'];
        }
        
        if (isset($data['content_type'])) {
            $updates[] = "content_type = ?";
            $params[] = $data['content_type'];
        }
        
        if (isset($data['start_datetime'])) {
            $updates[] = "start_datetime = ?";
            $params[] = $data['start_datetime'];
        }
        
        if (isset($data['end_datetime'])) {
            $updates[] = "end_datetime = ?";
            $params[] = $data['end_datetime'];
        }
        
        if (isset($data['target_role'])) {
            $updates[] = "target_role = ?";
            $params[] = $data['target_role'];
        }
        
        if (isset($data['target_division_id'])) {
            $updates[] = "target_division_id = ?";
            $params[] = $data['target_division_id'];
        }
        
        if (isset($data['target_lobby_id'])) {
            $updates[] = "target_lobby_id = ?";
            $params[] = $data['target_lobby_id'];
        }
        
        if (isset($data['is_active'])) {
            $updates[] = "is_active = ?";
            $params[] = (int)$data['is_active'];
        }
        
        if (isset($data['show_once'])) {
            $updates[] = "show_once = ?";
            $params[] = (int)$data['show_once'];
        }
        
        if (isset($data['image_url'])) {
            $updates[] = "image_url = ?";
            $params[] = $data['image_url'];
        }
        
        if (isset($data['image_position'])) {
            $updates[] = "image_position = ?";
            $params[] = $data['image_position'];
        }
        
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(['error' => 'No fields to update']);
            exit();
        }
        
        $sql = "UPDATE popup_messages SET " . implode(', ', $updates) . " WHERE id = ?";
        $params[] = $popup_id;
        
        $stmt = $db->prepare($sql);
        $result = $stmt->execute($params);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Popup updated successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update popup']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Update Popup Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
