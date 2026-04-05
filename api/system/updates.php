<?php
/**
 * Server-Sent Events (SSE) Endpoint for Real-time Updates
 * 
 * This endpoint provides real-time updates for:
 * - File uploads
 * - File deletions
 * - File edits
 * - New notifications
 */

// Disable output buffering for SSE
while (ob_get_level()) {
    ob_end_clean();
}

// Set SSE headers
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable Nginx buffering

// Set unlimited execution time for long-running connection
set_time_limit(0);
ignore_user_abort(true);

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/updates_errors.log');

require_once '../config/db_config.php';

// Get parameters
$user_id = $_GET['user_id'] ?? null;
$division_id = $_GET['division_id'] ?? null;
$lobby_id = $_GET['lobby_id'] ?? null;
$last_check = $_GET['last_check'] ?? date('Y-m-d H:i:s', strtotime('-1 day'));

if (!$user_id) {
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'User ID is required']) . "\n\n";
    flush();
    exit;
}

try {
    $db = getDBConnection();
    
    // Convert user_id to numeric if it's a CMS ID
    if (!is_numeric($user_id)) {
        $userStmt = $db->prepare("SELECT id, division, lobby FROM users WHERE cms_id = ?");
        $userStmt->execute([$user_id]);
        $userData = $userStmt->fetch();
        if ($userData) {
            $user_id = $userData['id'];
            // Get division and lobby IDs if not provided
            if (!$division_id && $userData['division']) {
                $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
                $divStmt->execute([$userData['division'], $userData['division']]);
                $divData = $divStmt->fetch();
                $division_id = $divData ? $divData['id'] : null;
            }
            if (!$lobby_id && $userData['lobby']) {
                $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
                $lobbyStmt->execute([$userData['lobby'], $userData['lobby']]);
                $lobbyData = $lobbyStmt->fetch();
                $lobby_id = $lobbyData ? $lobbyData['id'] : null;
            }
        }
    }
    
    // Send initial connection message
    echo "event: connected\n";
    echo "data: " . json_encode([
        'message' => 'Connected to real-time updates',
        'user_id' => $user_id,
        'timestamp' => date('Y-m-d H:i:s')
    ]) . "\n\n";
    flush();
    
    $lastCheckTime = $last_check;
    $heartbeatCounter = 0;
    
    // Main loop - check for updates every 2 seconds
    while (true) {
        // Check if client disconnected
        if (connection_aborted()) {
            break;
        }
        
        $updates = [];
        $currentTime = date('Y-m-d H:i:s');
        
        // 1. Check for file updates
        $fileSql = "SELECT fu.*, f.name as file_name, f.file_type, f.section, f.title,
                           d.name as division_name, l.name as lobby_name
                    FROM file_updates fu
                    LEFT JOIN files f ON fu.file_id = f.id
                    LEFT JOIN divisions d ON fu.target_division_id = d.id
                    LEFT JOIN lobbies l ON fu.target_lobby_id = l.id
                    WHERE fu.created_at > ?
                    AND (fu.target_division_id IS NULL OR fu.target_division_id = ? OR ? IS NULL)
                    AND (fu.target_lobby_id IS NULL OR fu.target_lobby_id = ? OR ? IS NULL)
                    ORDER BY fu.created_at DESC
                    LIMIT 50";
        
        $fileStmt = $db->prepare($fileSql);
        $fileStmt->execute([$lastCheckTime, $division_id, $division_id, $lobby_id, $lobby_id]);
        $fileUpdates = $fileStmt->fetchAll();
        
        if (!empty($fileUpdates)) {
            $updates['files'] = $fileUpdates;
        }
        
        // 2. Check for new notifications
        $notifSql = "SELECT n.*, d.name as division_name, l.name as lobby_name,
                            u.name as created_by_name
                     FROM notifications n
                     LEFT JOIN divisions d ON n.target_division_id = d.id
                     LEFT JOIN lobbies l ON n.target_lobby_id = l.id
                     LEFT JOIN users u ON n.created_by = u.id
                     LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                     WHERE n.created_at > ?
                     AND n.is_active = 1
                     AND (un.is_read IS NULL OR un.is_read = 0)
                     AND (
                         (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                         OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                         OR (n.target_lobby_id = ?)
                     )
                     ORDER BY n.created_at DESC
                     LIMIT 20";
        
        $notifStmt = $db->prepare($notifSql);
        $notifStmt->execute([$user_id, $lastCheckTime, $division_id, $lobby_id]);
        $notifications = $notifStmt->fetchAll();
        
        if (!empty($notifications)) {
            $updates['notifications'] = $notifications;
        }
        
        // 3. Check for new popup messages
        $popupSql = "SELECT pm.*, d.name as division_name, l.name as lobby_name
                     FROM popup_messages pm
                     LEFT JOIN divisions d ON pm.target_division_id = d.id
                     LEFT JOIN lobbies l ON pm.target_lobby_id = l.id
                     LEFT JOIN popup_views pv ON pm.id = pv.popup_id AND pv.user_id = ?
                     WHERE pm.is_active = 1
                     AND pm.start_datetime <= NOW()
                     AND pm.end_datetime >= NOW()
                     AND (pm.show_once = 0 OR pv.id IS NULL)
                     AND (
                         pm.target_role = 'all'
                         OR (pm.target_role = 'crew' AND EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'crew'))
                         OR (pm.target_role = 'lobby' AND EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'lobby'))
                         OR (pm.target_role = 'division' AND EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'division'))
                         OR (pm.target_role = 'super' AND EXISTS (SELECT 1 FROM users WHERE id = ? AND role = 'super'))
                     )
                     AND (pm.target_division_id IS NULL OR pm.target_division_id = ? OR ? IS NULL)
                     AND (pm.target_lobby_id IS NULL OR pm.target_lobby_id = ? OR ? IS NULL)
                     ORDER BY pm.created_at DESC
                     LIMIT 10";
        
        $popupStmt = $db->prepare($popupSql);
        $popupStmt->execute([
            $user_id, $user_id, $user_id, $user_id, $user_id,
            $division_id, $division_id, $lobby_id, $lobby_id
        ]);
        $popups = $popupStmt->fetchAll();
        
        if (!empty($popups)) {
            $updates['popups'] = $popups;
        }
        
        // Send updates if any found
        if (!empty($updates)) {
            echo "event: update\n";
            echo "data: " . json_encode([
                'timestamp' => $currentTime,
                'updates' => $updates
            ]) . "\n\n";
            flush();
        }
        
        // Send heartbeat every 30 seconds to keep connection alive
        $heartbeatCounter++;
        if ($heartbeatCounter >= 15) { // 15 * 2 seconds = 30 seconds
            echo "event: heartbeat\n";
            echo "data: " . json_encode(['timestamp' => $currentTime]) . "\n\n";
            flush();
            $heartbeatCounter = 0;
        }
        
        // Update last check time
        $lastCheckTime = $currentTime;
        
        // Sleep for 2 seconds before next check
        sleep(2);
    }
    
} catch (Exception $e) {
    error_log("SSE Error: " . $e->getMessage());
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'Server error: ' . $e->getMessage()]) . "\n\n";
    flush();
}

// Clean up
if (isset($db)) {
    $db = null;
}
?>
