<?php
ob_start();
/**
 * Get Notifications API
 * 
 * Notification Scope Rules:
 * - Main Tab notices (target_division_id = NULL, target_lobby_id = NULL): ALL users see these
 * - Division Tab notices (target_division_id set, target_lobby_id = NULL): Only users of that division see these
 * - Lobby Tab notices (target_lobby_id set): Only users of that specific lobby see these
 */

header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT'); // Date in the past
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Disable error display to prevent HTML output in JSON response
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/notification_errors.log');
error_reporting(E_ALL);

// Custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    // Don't exit on non-fatal errors, just log them
    return true;
});

// Custom exception handler
set_exception_handler(function($e) {
    error_log("Uncaught Exception: " . $e->getMessage());
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
    exit();
});

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    if (ob_get_length()) ob_clean();
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

try {
    $db = getDBConnection();

    // Ensure database columns exist (Self-healing migration)
    try {
        $checkCols = $db->query("SHOW COLUMNS FROM notifications LIKE 'file_id'")->fetch();
        if (!$checkCols) {
            $db->exec("ALTER TABLE notifications ADD COLUMN file_id VARCHAR(100) DEFAULT NULL AFTER target_lobby_id");
            error_log("Migrated notifications table: added file_id");
        }
        $checkCols2 = $db->query("SHOW COLUMNS FROM notifications LIKE 'tab_id'")->fetch();
        if (!$checkCols2) {
            $db->exec("ALTER TABLE notifications ADD COLUMN tab_id VARCHAR(100) DEFAULT NULL AFTER file_id");
            error_log("Migrated notifications table: added tab_id");
        }
    } catch (Exception $e) {
        error_log("Migration check error: " . $e->getMessage());
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        $user_role = $_GET['role'] ?? null;
        $user_division = $_GET['division'] ?? null;
        $user_lobby = $_GET['lobby'] ?? null;
        $limit = (int)($_GET['limit'] ?? 20);
        $unread_only = isset($_GET['unread_only']) && $_GET['unread_only'] === 'true';
        $mark_as_read = isset($_GET['mark_as_read']) && $_GET['mark_as_read'] === 'true';
        
        if (!$user_id) {
            if (ob_get_length()) ob_clean();
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }
        
        // If user_id is not numeric, convert from cms_id
        if (!is_numeric($user_id)) {
            $userLookup = $db->prepare("SELECT id, role, division, lobby FROM users WHERE cms_id = ?");
            $userLookup->execute([$user_id]);
            $userData = $userLookup->fetch();
            if ($userData) {
                $user_id = $userData['id'];
                $user_role = $user_role ?: $userData['role'];
                $user_division = $user_division ?: $userData['division'];
                $user_lobby = $user_lobby ?: $userData['lobby'];
            } else {
                if (ob_get_length()) ob_clean();
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
        }
        
        // Get user details if not provided
        if (!$user_role || !$user_division) {
            $userStmt = $db->prepare("SELECT role, division, lobby FROM users WHERE id = ?");
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch();
            
            if (!$user) {
                if (ob_get_length()) ob_clean();
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
            
            $user_role = $user['role'];
            $user_division = $user['division'];
            $user_lobby = $user_lobby ?: $user['lobby'];
        }
        
        // Get division ID from division code
        $divisionId = null;
        if ($user_division) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$user_division, $user_division]);
            $divData = $divStmt->fetch();
            $divisionId = $divData ? $divData['id'] : null;
        }
        
        // Get lobby ID from lobby name
        $lobbyId = null;
        if ($user_lobby) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
            $lobbyStmt->execute([$user_lobby, $user_lobby]);
            $lobbyData = $lobbyStmt->fetch();
            $lobbyId = $lobbyData ? $lobbyData['id'] : null;
        }
        
        // Debug logging
        error_log("Get Notifications - user_id: $user_id, user_division: $user_division, user_lobby: $user_lobby, divisionId: $divisionId, lobbyId: " . ($lobbyId ?? 'null'));
        
        /**
         * Notification visibility logic:
         * 1. Main Tab notices (target_division_id IS NULL AND target_lobby_id IS NULL): Everyone sees
         * 2. Division notices (target_division_id = user's division AND target_lobby_id IS NULL): 
         *    Only users of that division and its lobbies see
         * 3. Lobby notices (target_lobby_id = user's lobby): Only that specific lobby's users see
         */
        
        // Build dynamic SQL based on user's division and lobby
        $sql = "SELECT DISTINCT n.id, n.title, n.message, n.type, n.created_at,
                       n.target_division_id, n.target_lobby_id,
                       n.file_id, n.tab_id,
                       u.name as created_by_name,
                       d.name as division_name,
                       l.name as lobby_name,
                       COALESCE(un.is_read, 0) as is_read,
                       CASE 
                         WHEN n.target_division_id IS NULL AND n.target_lobby_id IS NULL THEN 'main'
                         WHEN n.target_lobby_id IS NOT NULL THEN 'lobby'
                         ELSE 'division'
                       END as scope
                FROM notifications n
                LEFT JOIN users u ON n.created_by = u.id
                LEFT JOIN divisions d ON n.target_division_id = d.id
                LEFT JOIN lobbies l ON n.target_lobby_id = l.id
                LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                WHERE n.is_active = 1
                AND (
                    -- Main tab notices: visible to all (no division or lobby specified)
                    (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)";        
        // Add division condition if user has a division
        $params = [$user_id];
        if ($divisionId) {
            $sql .= "
                    -- Division notices: visible to users of that division (including all lobbies)
                    OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)";
            $params[] = $divisionId;
        }
        
        // Add lobby condition if user has a lobby
        if ($lobbyId) {
            $sql .= "
                    -- Lobby notices: visible only to users of that specific lobby
                    OR (n.target_lobby_id = ?)";
            $params[] = $lobbyId;
        }
        
        $sql .= ")";
        
        // Exclude dismissed notifications (user has cleared them)
        $sql .= " AND (un.is_dismissed IS NULL OR un.is_dismissed = 0)";
        
        // Add unread filter if requested
        if ($unread_only) {
            $sql .= " AND (un.is_read IS NULL OR un.is_read = 0)";
        }

        
        $sql .= " ORDER BY n.created_at DESC LIMIT ?";
        $params[] = $limit;
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $notifications = $stmt->fetchAll();
        
        // Debug: Log found notifications
        error_log("Get Notifications - Found " . count($notifications) . " notifications for user $user_id (division: " . ($divisionId ?? 'null') . ", lobby: " . ($lobbyId ?? 'null') . ")");
        
        // Get unread count - build dynamic query similar to above
        $unreadSql = "SELECT COUNT(*) as unread_count
                      FROM notifications n
                      LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                      WHERE n.is_active = 1
                      AND (un.is_read IS NULL OR un.is_read = 0)
                      AND (un.is_dismissed IS NULL OR un.is_dismissed = 0)
                      AND (
                          (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)";
        
        $unreadParams = [$user_id];
        if ($divisionId) {
            $unreadSql .= " OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)";
            $unreadParams[] = $divisionId;
        }
        if ($lobbyId) {
            $unreadSql .= " OR (n.target_lobby_id = ?)";
            $unreadParams[] = $lobbyId;
        }
        $unreadSql .= ")";
        
        $unreadStmt = $db->prepare($unreadSql);
        $unreadStmt->execute($unreadParams);
        $unreadData = $unreadStmt->fetch();
        $unreadCount = $unreadData ? (int)$unreadData['unread_count'] : 0;
        
        // Mark as read if requested
        if ($mark_as_read && count($notifications) > 0) {
            foreach ($notifications as $notification) {
                $readStmt = $db->prepare("INSERT INTO user_notifications (user_id, notification_id, is_read, read_at) 
                                          VALUES (?, ?, 1, NOW()) 
                                          ON DUPLICATE KEY UPDATE is_read = 1, read_at = NOW()");
                $readStmt->execute([$user_id, $notification['id']]);
            }
        }
        
        if (ob_get_length()) ob_clean();
        echo json_encode([
            'success' => true,
            'notifications' => $notifications,
            'count' => count($notifications),
            'unread_count' => $unreadCount,
            'user_division_id' => $divisionId,
            'user_lobby_id' => $lobbyId
        ]);
        
    } else {
        if (ob_get_length()) ob_clean();
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Get Notifications Error: " . $e->getMessage());
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>