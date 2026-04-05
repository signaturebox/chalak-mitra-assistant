<?php
/**
 * Real-time Notification Updates API
 * 
 * Server-Sent Events (SSE) endpoint for real-time notification updates
 * Clients connect to this endpoint to receive instant updates when new files are uploaded
 */

header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

// Disable output buffering
if (ob_get_level()) {
    ob_end_clean();
}

// Get user parameters
$user_id = $_GET['user_id'] ?? null;
$user_division = $_GET['division'] ?? null;
$user_lobby = $_GET['lobby'] ?? null;

if (!$user_id) {
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'User ID is required']) . "\n\n";
    exit();
}

try {
    $db = getDBConnection();
    
    // Lookup user details to ensure we have division and lobby
    $lookupField = is_numeric($user_id) ? 'id' : 'cms_id';
    $userLookup = $db->prepare("SELECT id, division, lobby FROM users WHERE $lookupField = ?");
    $userLookup->execute([$user_id]);
    $userData = $userLookup->fetch();
    
    if ($userData) {
        $user_id = $userData['id'];
        $user_division = $user_division ?: $userData['division'];
        $user_lobby = $user_lobby ?: $userData['lobby'];
    } else if (!is_numeric($user_id)) {
        echo "event: error\n";
        echo "data: " . json_encode(['error' => 'User not found']) . "\n\n";
        exit();
    }
    
    // Get division ID
    $divisionId = null;
    if ($user_division) {
        $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
        $divStmt->execute([$user_division, $user_division]);
        $divData = $divStmt->fetch();
        $divisionId = $divData ? $divData['id'] : null;
    }
    
    // Get lobby ID
    $lobbyId = null;
    if ($user_lobby) {
        $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
        $lobbyStmt->execute([$user_lobby, $user_lobby]);
        $lobbyData = $lobbyStmt->fetch();
        $lobbyId = $lobbyData ? $lobbyData['id'] : null;
    }
    
    // Track last sent IDs to avoid duplicates
    // Client can provide last known IDs to sync seamlessly
    $lastFileId = (int)($_GET['last_file_id'] ?? 0);
    $lastNotifId = (int)($_GET['last_notif_id'] ?? 0);
    
    // If no IDs provided, start from current MAX so we only push NEW events
    if ($lastFileId === 0) {
        $lastFileIdStmt = $db->query("SELECT MAX(id) FROM files");
        $lastFileId = (int)$lastFileIdStmt->fetchColumn() ?: 0;
    }
    
    if ($lastNotifId === 0) {
        $lastNotifIdStmt = $db->query("SELECT MAX(id) FROM notifications");
        $lastNotifId = (int)$lastNotifIdStmt->fetchColumn() ?: 0;
    }
    
    // Send initial connection success
    echo "event: connected\n";
    echo "data: " . json_encode([
        'message' => 'Connected to real-time updates',
        'user_id' => $user_id,
        'timestamp' => date('Y-m-d H:i:s')
    ]) . "\n\n";
    flush();
    
    // Keep connection alive and check for updates
    $counter = 0;
    while (true) {
        // Check for new files since last check or higher than last ID
        $newFilesSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at,
                               f.division_id, f.lobby_id,
                               d.name as division_name,
                               l.name as lobby_name,
                               u.name as uploaded_by_name
                        FROM files f
                        LEFT JOIN divisions d ON f.division_id = d.id
                        LEFT JOIN lobbies l ON f.lobby_id = l.id
                        LEFT JOIN users u ON f.uploaded_by = u.id
                        WHERE f.is_active = 1
                        AND f.id > ?
                        AND (
                            (f.division_id = ? OR f.lobby_id = ?)
                            OR (f.division_id IS NULL AND f.lobby_id IS NULL)
                        )
                        AND NOT EXISTS (
                            SELECT 1 FROM file_views fv 
                            WHERE fv.file_id = f.id AND fv.user_id = ?
                        )
                        ORDER BY f.id ASC";
        
        $newFilesStmt = $db->prepare($newFilesSql);
        $newFilesStmt->execute([$lastFileId, $divisionId, $lobbyId, $user_id]);
        $newFiles = $newFilesStmt->fetchAll();
        
        if (!empty($newFiles)) {
            // Update last file ID
            $lastFileId = end($newFiles)['id'];
            
            // Calculate hierarchical counters
            $counters = [
                'division' => 0,
                'lobby' => 0,
                'tabs' => []
            ];
            
            foreach ($newFiles as $file) {
                $counters['division']++;
                if ($file['lobby_id'] == $lobbyId) {
                    $counters['lobby']++;
                }
                $section = $file['section'] ?? 'General';
                if (!isset($counters['tabs'][$section])) {
                    $counters['tabs'][$section] = 0;
                }
                $counters['tabs'][$section]++;
            }
            
            // Send update event
            echo "event: new_files\n";
            echo "data: " . json_encode([
                'type' => 'new_files',
                'files' => $newFiles,
                'counters' => $counters,
                'timestamp' => date('Y-m-d H:i:s')
            ]) . "\n\n";
            flush();
        }
        
        // Check for system notifications
        $notifSql = "SELECT n.id, n.title, n.message, n.type, n.created_at,
                            n.file_id, n.tab_id,
                            d.name as division_name,
                            l.name as lobby_name
                     FROM notifications n
                     LEFT JOIN divisions d ON n.target_division_id = d.id
                     LEFT JOIN lobbies l ON n.target_lobby_id = l.id
                     LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                     WHERE n.is_active = 1
                     AND n.id > ?
                     AND (un.is_read IS NULL OR un.is_read = 0)
                     AND (un.is_dismissed IS NULL OR un.is_dismissed = 0)
                     AND (
                         (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                         OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                         OR (n.target_lobby_id = ?)
                     )
                     ORDER BY n.id ASC";
        
        $notifStmt = $db->prepare($notifSql);
        $notifStmt->execute([$user_id, $lastNotifId, $divisionId, $lobbyId]);
        $newNotifications = $notifStmt->fetchAll();
        
        if (!empty($newNotifications)) {
            // Update last notification ID
            $lastNotifId = end($newNotifications)['id'];
            
            echo "event: notification\n";
            echo "data: " . json_encode([
                'type' => 'notification',
                'notifications' => $newNotifications,
                'timestamp' => date('Y-m-d H:i:s')
            ]) . "\n\n";
            flush();
        }
        
        // Send heartbeat every 30 seconds
        $counter++;
        if ($counter >= 30) {
            echo "event: heartbeat\n";
            echo "data: " . json_encode(['timestamp' => date('Y-m-d H:i:s')]) . "\n\n";
            flush();
            $counter = 0;
        }
        
        // Sleep for 1 second before next check
        sleep(1);

        
        // Check if client disconnected
        if (connection_aborted()) {
            break;
        }
    }
    
} catch (Exception $e) {
    error_log("Realtime Updates Error: " . $e->getMessage());
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'Server error: ' . $e->getMessage()]) . "\n\n";
}
?>
