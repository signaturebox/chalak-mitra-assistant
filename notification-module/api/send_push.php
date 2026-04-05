<?php
/**
 * Send Push Notification API
 * 
 * Called when admin uploads a file to send push notifications to users
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../../api/config/db_config.php';

// VAPID keys - REPLACE WITH YOUR OWN
$VAPID_PUBLIC_KEY = 'BF5PeSLhMMa3AY85E8UaSEcTJ9oXphujuCiGSaBT-WFMQi_izNoKi-tLCwwgubMxs4jQh8CAwtKaKFU2PKyCUKI';
$VAPID_PRIVATE_KEY = 'YOUR_PRIVATE_KEY_HERE'; // Replace with your private key

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $file_id = $data['file_id'] ?? null;
        $file_name = $data['file_name'] ?? 'New File';
        $section = $data['section'] ?? 'General';
        $division_id = $data['division_id'] ?? null;
        $lobby_id = $data['lobby_id'] ?? null;
        $uploader_id = $data['uploader_id'] ?? null;
        
        if (!$file_id) {
            http_response_code(400);
            echo json_encode(['error' => 'File ID is required']);
            exit();
        }
        
        // Get division and lobby info
        $division_name = null;
        $lobby_name = null;
        
        if ($division_id) {
            $divStmt = $db->prepare("SELECT name FROM divisions WHERE id = ?");
            $divStmt->execute([$division_id]);
            $divData = $divStmt->fetch();
            $division_name = $divData ? $divData['name'] : null;
        }
        
        if ($lobby_id) {
            $lobbyStmt = $db->prepare("SELECT name FROM lobbies WHERE id = ?");
            $lobbyStmt->execute([$lobby_id]);
            $lobbyData = $lobbyStmt->fetch();
            $lobby_name = $lobbyData ? $lobbyData['name'] : null;
        }
        
        // Build notification message
        $title = 'New File Uploaded';
        $body = $file_name;
        if ($section && $section !== 'General') {
            $body .= ' in ' . $section;
        }
        if ($lobby_name && $lobby_name !== 'General') {
            $body .= ' (' . $lobby_name . ')';
        }
        
        // Get target subscriptions
        $sql = "SELECT ps.*, u.cms_id 
                FROM push_subscriptions ps
                JOIN users u ON ps.user_id = u.id
                WHERE ps.user_id != ?";
        $params = [$uploader_id];
        
        if ($division_id) {
            $sql .= " AND (ps.division = ? OR ps.division IS NULL OR ps.division = '')";
            $params[] = $division_name;
        }
        
        if ($lobby_id) {
            $sql .= " AND (ps.lobby = ? OR ps.lobby IS NULL OR ps.lobby = '')";
            $params[] = $lobby_name;
        }
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $subscriptions = $stmt->fetchAll();
        
        $sent = 0;
        $failed = 0;
        
        // Send push notifications
        foreach ($subscriptions as $sub) {
            $payload = json_encode([
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'icon' => '/assets/images/chalak-mitra-logo.png',
                    'badge' => '/assets/images/chalak-mitra-logo.png',
                    'tag' => 'file-upload-' . $file_id,
                    'data' => [
                        'file_id' => $file_id,
                        'section' => $section,
                        'url' => '/divisions?tab=' . urlencode($section)
                    ],
                    'actions' => [
                        ['action' => 'open', 'title' => 'View File']
                    ]
                ]
            ]);
            
            // Use web-push library or curl to send
            $result = sendWebPush($sub, $payload, $VAPID_PUBLIC_KEY, $VAPID_PRIVATE_KEY);
            
            if ($result) {
                $sent++;
            } else {
                $failed++;
                // Remove invalid subscription
                $deleteStmt = $db->prepare("DELETE FROM push_subscriptions WHERE id = ?");
                $deleteStmt->execute([$sub['id']]);
            }
        }
        
        echo json_encode([
            'success' => true,
            'sent' => $sent,
            'failed' => $failed,
            'total' => count($subscriptions)
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Send Push Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

/**
 * Send web push notification using curl
 */
function sendWebPush($subscription, $payload, $publicKey, $privateKey) {
    $endpoint = $subscription['endpoint'];
    
    // Parse endpoint to determine push service
    $headers = [
        'Content-Type: application/json',
        'TTL: 2419200',
        'Urgency: normal'
    ];
    
    // For simplicity, using a basic curl request
    // In production, use a proper web-push library
    $ch = curl_init($endpoint);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode >= 200 && $httpCode < 300;
}
?>
