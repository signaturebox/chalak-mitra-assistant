<?php
/**
 * Delete Popup Message API
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    $popup_id = null;
    $user_id = null;
    
    // Support both POST and DELETE methods
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $popup_id = $data['popup_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $popup_id = $_GET['popup_id'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
    }
    
    if (!$popup_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Popup ID is required']);
        exit();
    }
    
    // Check if user has permission to delete
    if ($user_id) {
        // Convert CMS ID if needed
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
        
        // Only super admin or the creator can delete
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
    
    // Delete popup views first (foreign key constraint)
    $viewStmt = $db->prepare("DELETE FROM popup_views WHERE popup_id = ?");
    $viewStmt->execute([$popup_id]);
    
    // Delete the popup
    $stmt = $db->prepare("DELETE FROM popup_messages WHERE id = ?");
    $result = $stmt->execute([$popup_id]);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Popup deleted successfully'
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to delete popup']);
    }
    
} catch (Exception $e) {
    error_log("Delete Popup Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
