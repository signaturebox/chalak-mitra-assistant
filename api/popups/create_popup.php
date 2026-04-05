<?php
/**
 * Create Popup Message API
 * Supports text, HTML, and image content
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';
require_once '../notifications/push_notifier.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $title = $data['title'] ?? null;
        $content = $data['content'] ?? null;
        $content_type = $data['content_type'] ?? 'text';
        $start_datetime = $data['start_datetime'] ?? null;
        $end_datetime = $data['end_datetime'] ?? null;
        $target_role = $data['target_role'] ?? 'all';
        $target_division_id = $data['target_division_id'] ?? null;
        $target_lobby_id = $data['target_lobby_id'] ?? null;
        $target_lobby_name = $data['target_lobby_name'] ?? null;
        $is_active = isset($data['is_active']) ? (int)$data['is_active'] : 1;
        $show_once = isset($data['show_once']) ? (int)$data['show_once'] : 1;
        $created_by = $data['created_by'] ?? null;
        $image_url = $data['image_url'] ?? null;
        $image_position = $data['image_position'] ?? 'top';
        
        // Validation
        if (!$title || !$start_datetime || !$end_datetime || !$created_by) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing required fields: title, start_datetime, end_datetime, created_by']);
            exit();
        }
        
        // Content is required unless it's an image-only popup
        if (!$content && !$image_url) {
            http_response_code(400);
            echo json_encode(['error' => 'Either content or image_url is required']);
            exit();
        }
        
        // Convert created_by from CMS ID if needed
        if (!is_numeric($created_by)) {
            $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $userStmt->execute([$created_by]);
            $userData = $userStmt->fetch();
            if ($userData) {
                $created_by = $userData['id'];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Creator user not found']);
                exit();
            }
        }
        
        // Resolve lobby name to ID if provided
        if ($target_lobby_name && !$target_lobby_id) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
            $lobbyStmt->execute([$target_lobby_name, $target_lobby_name]);
            $lobbyData = $lobbyStmt->fetch();
            if ($lobbyData) {
                $target_lobby_id = $lobbyData['id'];
            }
        }
        
        // Resolve division name to ID if provided
        if ($target_division_id && !is_numeric($target_division_id)) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$target_division_id, $target_division_id]);
            $divData = $divStmt->fetch();
            if ($divData) {
                $target_division_id = $divData['id'];
            }
        }
        
        // Insert popup with image support
        $stmt = $db->prepare("INSERT INTO popup_messages 
            (title, content, content_type, start_datetime, end_datetime, target_role, 
             target_division_id, target_lobby_id, is_active, show_once, created_by, image_url, image_position) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $title,
            $content ?? '',
            $content_type,
            $start_datetime,
            $end_datetime,
            $target_role,
            $target_division_id,
            $target_lobby_id,
            $is_active,
            $show_once,
            $created_by,
            $image_url,
            $image_position
        ]);
        
        if ($result) {
            $popupId = $db->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'message' => 'Popup created successfully',
                'popup_id' => $popupId
            ]);

            // Trigger Push Notification for Popup
            try {
                // Determine target division/lobby names for OneSignal tags
                $targetDivName = null;
                if ($target_division_id) {
                    $divStmt = $db->prepare("SELECT name FROM divisions WHERE id = ?");
                    $divStmt->execute([$target_division_id]);
                    $targetDivName = $divStmt->fetchColumn();
                }

                $targetLobbyName = null;
                if ($target_lobby_id) {
                    $lobbyStmt = $db->prepare("SELECT name FROM lobbies WHERE id = ?");
                    $lobbyStmt->execute([$target_lobby_id]);
                    $targetLobbyName = $lobbyStmt->fetchColumn();
                }

                // Use the wrapper function which includes both tag-based and external ID-based pushes
                sendPushToTargetUsers($db, $title, "📢 New Notice: " . (strlen($content) > 100 ? substr($content, 0, 97) . "..." : $content), $target_division_id, $target_lobby_id, [
                    'popup_id' => $popupId,
                    'type' => 'popup_notice'
                ]);
            } catch (Exception $pushError) {
                error_log("Push error in create_popup: " . $pushError->getMessage());
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create popup']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Create Popup Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
