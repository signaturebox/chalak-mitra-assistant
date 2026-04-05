<?php
/**
 * Save Push Subscription API
 * 
 * Saves web push subscription data for a user to enable
 * background notifications even when the app is closed.
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
        $data = json_decode(file_get_contents('php://input'), true);
        
        $user_id = $data['user_id'] ?? null;
        $subscription = $data['subscription'] ?? null;
        $division = $data['division'] ?? null;
        $lobby = $data['lobby'] ?? null;
        $role = $data['role'] ?? 'crew';
        
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
        
        // Create table if not exists (without foreign keys to avoid constraint issues)
        $db->exec("CREATE TABLE IF NOT EXISTS push_subscriptions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            endpoint VARCHAR(500) NOT NULL,
            p256dh VARCHAR(255) NOT NULL,
            auth VARCHAR(255) NOT NULL,
            division VARCHAR(100),
            lobby VARCHAR(100),
            role VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            UNIQUE KEY unique_endpoint (endpoint),
            INDEX idx_user (user_id),
            INDEX idx_division (division),
            INDEX idx_lobby (lobby)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        
        // Save or update subscription
        $stmt = $db->prepare("INSERT INTO push_subscriptions 
            (user_id, endpoint, p256dh, auth, division, lobby, role) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            user_id = VALUES(user_id),
            p256dh = VALUES(p256dh),
            auth = VALUES(auth),
            division = VALUES(division),
            lobby = VALUES(lobby),
            role = VALUES(role),
            updated_at = CURRENT_TIMESTAMP");
        
        $stmt->execute([
            $user_id,
            $subscription['endpoint'],
            $subscription['keys']['p256dh'],
            $subscription['keys']['auth'],
            $division,
            $lobby,
            $role
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Push subscription saved successfully'
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Save Push Subscription Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
