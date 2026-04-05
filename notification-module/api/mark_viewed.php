<?php
/**
 * Mark File as Viewed API
 * 
 * Records that a user has viewed a file
 * Removes "New" badge for this user
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
        $file_id = $data['file_id'] ?? null;
        
        if (!$user_id || !$file_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID and File ID are required']);
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
        
        // Create file_views table if not exists
        try {
            $db->exec("CREATE TABLE IF NOT EXISTS file_views (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                file_id INT NOT NULL,
                viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_user_file_view (user_id, file_id),
                KEY idx_user_id (user_id),
                KEY idx_file_id (file_id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        } catch (Exception $e) {
            error_log("Error creating file_views table: " . $e->getMessage());
        }
        
        // Insert or update view record
        $stmt = $db->prepare("INSERT INTO file_views (user_id, file_id, viewed_at) 
                              VALUES (?, ?, NOW())
                              ON DUPLICATE KEY UPDATE viewed_at = NOW()");
        $stmt->execute([$user_id, $file_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'File marked as viewed',
            'user_id' => $user_id,
            'file_id' => $file_id
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Mark Viewed Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
