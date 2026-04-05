<?php
/**
 * Create Notification API
 * Creates notifications when files/notices are uploaded
 * 
 * Notification Scope Rules:
 * - Main Tab (Super Admin): All divisions and their lobbies get notified
 * - Division Tab (Division Admin): Only that division and its lobbies get notified
 * - Lobby Tab (Lobby Admin): Only that specific lobby gets notified
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';
require_once './push_notifier.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }
        
        // Debug logging
        error_log("Create Notification Input: " . print_r($input, true));
        
        $title = $input['title'] ?? 'New Content Added';
        $message = $input['message'] ?? '';
        $type = $input['type'] ?? 'info'; // info, warning, success, announcement
        $created_by = $input['created_by'] ?? null;
        $scope = $input['scope'] ?? 'main'; // main, division, lobby
        $division_id = isset($input['division_id']) && $input['division_id'] !== null && $input['division_id'] !== '' ? $input['division_id'] : null;
        $lobby_id = isset($input['lobby_id']) && $input['lobby_id'] !== null && $input['lobby_id'] !== '' ? $input['lobby_id'] : null;
        $file_id = $input['file_id'] ?? null;
        $tab_id = $input['tab_id'] ?? null;
        
        error_log("Parsed values - scope: $scope, division_id: $division_id, lobby_id: $lobby_id");
        
        // Validate required fields
        if (!$created_by) {
            http_response_code(400);
            echo json_encode(['error' => 'Creator ID is required']);
            exit();
        }
        
        // Convert created_by if it's a CMS ID
        if (!is_numeric($created_by)) {
            $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $userStmt->execute([$created_by]);
            $userData = $userStmt->fetch();
            if ($userData) {
                $created_by = $userData['id'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid creator ID']);
                exit();
            }
        }
        
        // Convert division_id if string (name or code)
        if ($division_id !== null && !is_numeric($division_id)) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$division_id, $division_id]);
            $divData = $divStmt->fetch();
            $division_id = $divData ? $divData['id'] : null;
            error_log("Division lookup result: " . ($division_id ?? 'null'));
        }
        
        // Convert lobby_id if string (name or code)
        if ($lobby_id !== null && !is_numeric($lobby_id)) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE code = ? OR name = ?");
            $lobbyStmt->execute([$lobby_id, $lobby_id]);
            $lobbyData = $lobbyStmt->fetch();
            $lobby_id = $lobbyData ? $lobbyData['id'] : null;
            error_log("Lobby lookup result: " . ($lobby_id ?? 'null'));
        }
        
        // Determine target_role based on scope
        $target_role = 'all';
        $target_division_id = null;
        $target_lobby_id = null;
        
        if ($scope === 'lobby' && $lobby_id) {
            // Lobby scope: Only that lobby's crew get notified
            $target_role = 'crew';
            $target_lobby_id = $lobby_id;
            
            // Get division from lobby
            $lobbyDivStmt = $db->prepare("SELECT division_id FROM lobbies WHERE id = ?");
            $lobbyDivStmt->execute([$lobby_id]);
            $lobbyDiv = $lobbyDivStmt->fetch();
            if ($lobbyDiv) {
                $target_division_id = $lobbyDiv['division_id'];
            }
            error_log("Lobby scope - target_division_id: $target_division_id, target_lobby_id: $target_lobby_id");
        } elseif ($scope === 'division' && $division_id) {
            // Division scope: That division and its lobbies get notified
            $target_role = 'crew';
            $target_division_id = $division_id;
            error_log("Division scope - target_division_id: $target_division_id");
        } else {
            // Main scope: All users get notified
            $target_role = 'all';
            error_log("Main scope - visible to all");
        }
        
        // Insert notification
        $stmt = $db->prepare("INSERT INTO notifications (title, message, type, target_role, target_division_id, target_lobby_id, file_id, tab_id, created_by, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
        
        $result = $stmt->execute([
            $title,
            $message,
            $type,
            $target_role,
            $target_division_id,
            $target_lobby_id,
            $file_id,
            $tab_id,
            $created_by
        ]);
        
        if ($result) {
            $notification_id = $db->lastInsertId();
            
            error_log("Notification created successfully - ID: $notification_id, scope: $scope, target_division_id: $target_division_id, target_lobby_id: $target_lobby_id");
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification created successfully',
                'notification_id' => $notification_id,
                'scope' => $scope,
                'target_division_id' => $target_division_id,
                'target_lobby_id' => $target_lobby_id
            ]);

            // Trigger Push Notification
            try {
                sendPushToTargetUsers($db, $title, $message, $target_division_id, $target_lobby_id, [
                    'notification_id' => $notification_id,
                    'type' => 'system_notification',
                    'tab_id' => $tab_id
                ]);
            } catch (Exception $pushError) {
                error_log("Push error in create_notification: " . $pushError->getMessage());
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create notification']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Create Notification Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
