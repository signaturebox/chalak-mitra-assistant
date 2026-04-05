<?php
/**
 * Manual Push Notification Test Script
 * Usage: http://your-site.com/api/test_push.php?title=Hello&message=Testing
 * Or: http://your-site.com/api/test_push.php?division_id=1&lobby_id=5
 */
require_once 'config/db_config.php';
require_once 'notifications/push_notifier.php';

header('Content-Type: application/json');

// Check if it's a browser hit or AJAX
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    die(json_encode(['error' => 'Method not allowed']));
}

// Params
$title = $_REQUEST['title'] ?? "Test: NWR Update";
$message = $_REQUEST['message'] ?? "This is a test notification to verify system tray functionality.";
$division_id = $_REQUEST['division_id'] ?? null;
$lobby_id = $_REQUEST['lobby_id'] ?? null;

try {
    $db = getDBConnection();

    // Log the attempt
    error_log("[TestPush] Triggering manual test from " . $_SERVER['REMOTE_ADDR']);

    // Trigger the push
    $result = sendPushToTargetUsers($db, $title, $message, $division_id, $lobby_id, [
        'type' => 'test_notification',
        'click_action' => '/dashboard',
        'timestamp' => time()
    ]);

    echo json_encode([
        'success' => true,
        'status' => 'Triggered',
        'target' => [
            'division_id' => $division_id,
            'lobby_id' => $lobby_id
        ],
        'details' => $result
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
