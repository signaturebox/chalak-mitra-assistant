<?php
/**
 * Mark Notification as Read API
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

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            $input = $_POST;
        }
        
        $user_id = $input['user_id'] ?? null;
        $notification_id = $input['notification_id'] ?? null;
        $mark_all = isset($input['mark_all']) && $input['mark_all'] === true;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }
        
        // Resolve user_id: Handle both numeric auto-increment ID and CMS ID
        $foundUserId = null;
        
        // 1. Try to find by auto-increment ID first (if numeric)
        if (is_numeric($user_id)) {
            $stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $userData = $stmt->fetch();
            if ($userData) $foundUserId = $userData['id'];
        }
        
        // 2. If not found by ID (or not numeric), try by CMS ID
        if (!$foundUserId) {
            $stmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $stmt->execute([(string)$user_id]);
            $userData = $stmt->fetch();
            if ($userData) {
                $foundUserId = $userData['id'];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found: ' . $user_id]);
                exit();
            }
        }
        $user_id = $foundUserId;
        
        if ($mark_all) {
            $clear_all = isset($input['clear_all']) && $input['clear_all'] === true;

            // Get user's division and lobby for filtering notifications
            $userStmt = $db->prepare("SELECT division, lobby FROM users WHERE id = ?");
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch();
            
            if ($user) {
                // Get division ID
                $divisionId = null;
                if ($user['division']) {
                    $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
                    $divStmt->execute([$user['division'], $user['division']]);
                    $divData = $divStmt->fetch();
                    $divisionId = $divData ? $divData['id'] : null;
                }
                
                // Get lobby ID
                $lobbyId = null;
                if ($user['lobby']) {
                    $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
                    $lobbyStmt->execute([$user['lobby'], $user['lobby']]);
                    $lobbyData = $lobbyStmt->fetch();
                    $lobbyId = $lobbyData ? $lobbyData['id'] : null;
                }
                
                // Ensure is_dismissed column exists
                try {
                    $db->exec("ALTER TABLE user_notifications ADD COLUMN IF NOT EXISTS is_dismissed TINYINT(1) NOT NULL DEFAULT 0");
                } catch (Exception $e) { /* column already exists */ }

                if ($clear_all) {
                    // Mark all as read AND dismissed (hidden from user's list)
                    $sql = "INSERT INTO user_notifications (user_id, notification_id, is_read, is_dismissed, read_at)
                            SELECT ?, n.id, 1, 1, NOW()
                            FROM notifications n
                            WHERE n.is_active = 1
                            AND (
                                (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                                OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                                OR (n.target_lobby_id = ?)
                            )
                            ON DUPLICATE KEY UPDATE is_read = 1, is_dismissed = 1, read_at = NOW()";
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$user_id, $divisionId, $lobbyId]);

                    echo json_encode([
                        'success' => true,
                        'message' => 'All notifications cleared'
                    ]);
                } else {
                    // Mark all visible notifications as read (not dismissed)
                    $sql = "INSERT INTO user_notifications (user_id, notification_id, is_read, read_at)
                            SELECT ?, n.id, 1, NOW()
                            FROM notifications n
                            WHERE n.is_active = 1
                            AND (
                                (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                                OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                                OR (n.target_lobby_id = ?)
                            )
                            ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()";
                    
                    $stmt = $db->prepare($sql);
                    $stmt->execute([$user_id, $divisionId, $lobbyId]);
                    
                    echo json_encode([
                        'success' => true,
                        'message' => 'All notifications marked as read'
                    ]);
                }
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
            }

        } else {
            // Mark single notification as read
            if (!$notification_id) {
                http_response_code(400);
                echo json_encode(['error' => 'Notification ID is required']);
                exit();
            }
            
            $stmt = $db->prepare("INSERT INTO user_notifications (user_id, notification_id, is_read, read_at) 
                                  VALUES (?, ?, 1, NOW()) 
                                  ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()");
            $stmt->execute([$user_id, $notification_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Notification marked as read'
            ]);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Mark Read Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
