<?php
/**
 * Save Push Subscription API
 * 
 * Saves web push subscription for a user
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

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        
        $user_id = $data['user_id'] ?? null;
        $subscription = $data['subscription'] ?? null;
        $division = $data['division'] ?? null;
        $lobby = $data['lobby'] ?? null;
        
        if (!$user_id || !$subscription) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and subscription are required']);
            exit();
        }
        
        // Convert user_id if it's a CMS ID
        if (!is_numeric($user_id)) {
            $userLookup = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $userLookup->execute([$user_id]);
            $userData = $userLookup->fetch();
            if ($userData) {
                $user_id = $userData['id'];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
        }
        
        // Create push_subscriptions table if not exists
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS push_subscriptions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                endpoint VARCHAR(500) NOT NULL,
                p256dh VARCHAR(255) NOT NULL,
                auth VARCHAR(255) NOT NULL,
                division VARCHAR(100),
                lobby VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_endpoint (endpoint),
                KEY idx_user_id (user_id),
                KEY idx_division (division),
                KEY idx_lobby (lobby)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (Exception $e) {
            error_log("Error creating push_subscriptions table: " . $e->getMessage());
        }
        
        // Delete existing subscription for this user
        $deleteStmt = $db->prepare("DELETE FROM push_subscriptions WHERE user_id = ?");
        $deleteStmt->execute([$user_id]);
        
        // Insert new subscription
        $stmt = $db->prepare("INSERT INTO push_subscriptions 
            (user_id, endpoint, p256dh, auth, division, lobby) 
            VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $user_id,
            $subscription['endpoint'],
            $subscription['keys']['p256dh'],
            $subscription['keys']['auth'],
            $division,
            $lobby
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Subscription saved successfully'
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Save Subscription Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
