<?php
/**
 * Send Push Notification API
 * 
 * Called by the frontend after a successful file/content upload
 * to trigger push notifications to relevant segments.
 */

header('Content-Type: application/json; charset=utf-8');

require_once '../config/db_config.php';
require_once './push_notifier.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $file_id = $data['file_id'] ?? null;
        $file_name = $data['file_name'] ?? 'New File';
        $division = $data['division'] ?? null;
        $lobby = $data['lobby'] ?? null;
        $section = $data['section'] ?? 'General';
        
        // Get target IDs to use the already written sendPushToTargetUsers helper
        $divisionId = null;
        if ($division) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$division, $division]);
            $divisionId = $divStmt->fetchColumn();
        }
        
        $lobbyId = null;
        if ($lobby) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
            $lobbyStmt->execute([$lobby, $lobby]);
            $lobbyId = $lobbyStmt->fetchColumn();
        }
        
        $title = "New 📋File: " . $file_name;
        $message = "A new 📋file has been uploaded to " . $section . ($lobby ? " in " . $lobby : ($division ? " in " . $division : ""));
        
        // Use the helper to send push to specific users based on their subscriptions
        // This helper now triggers both Web Push (from push_subscriptions table) 
        // and OneSignal Push (using division/lobby tags)
        $pushResult = sendPushToTargetUsers($db, $title, $message, $divisionId, $lobbyId, [
            'file_id' => $file_id,
            'type' => 'file_upload',
            'section' => $section
        ]);
        
        echo json_encode([
            'success' => true,
            'target_users' => $pushResult['legacy_count'] ?? 0,
            'onesignal' => $pushResult['onesignal'] ?? null,
            'message' => 'Push notifications initiated'
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    error_log("Send Push API Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
