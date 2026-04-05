<?php
/**
 * Mark File as Viewed API
 * 
 * Called when a user views a file to remove the "New" badge
 * and update the hierarchical counters
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
        $file_id = $data['file_id'] ?? null;
        $mark_all = $data['mark_all'] ?? false;
        $section = $data['section'] ?? null;
        
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
                echo json_encode(['error' => 'User not found. Provided ID: ' . $user_id]);
                exit();
            }
        }
        $user_id = $foundUserId;

        // Ensure file_views table exists
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
        } catch (Exception $e) { /* Ignore if it fails, maybe already exists or permission issue */ }
        
        $markedCount = 0;
        
        if ($mark_all) {
            // Mark all files in a section/tab as viewed
            if ($section) {
                // Get user division/lobby
                $userStmt = $db->prepare("SELECT division, lobby FROM users WHERE id = ?");
                $userStmt->execute([$user_id]);
                $user = $userStmt->fetch();
                
                if ($user) {
                    // Get division ID
                    $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
                    $divStmt->execute([$user['division'], $user['division']]);
                    $divData = $divStmt->fetch();
                    $divisionId = $divData ? $divData['id'] : null;
                    
                    // Get lobby ID
                    $lobbyId = null;
                    if ($user['lobby']) {
                        $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
                        $lobbyStmt->execute([$user['lobby'], $user['lobby']]);
                        $lobbyData = $lobbyStmt->fetch();
                        $lobbyId = $lobbyData ? $lobbyData['id'] : null;
                    }
                    
                    // Get all files in this section that haven't been viewed
                    $filesSql = "SELECT id FROM files 
                                WHERE is_active = 1 
                                AND (section = ? OR tab_id = ?)
                                AND (
                                    (division_id IS NULL AND lobby_id IS NULL)
                                    OR (division_id = ?)
                                    OR (lobby_id = ?)
                                )
                                AND NOT EXISTS (
                                    SELECT 1 FROM file_views 
                                    WHERE file_id = files.id AND user_id = ?
                                )";
                    $filesStmt = $db->prepare($filesSql);
                    $filesStmt->execute([$section, $section, $divisionId, $lobbyId, $user_id]);
                    $files = $filesStmt->fetchAll();
                    
                    foreach ($files as $file) {
                        $insertStmt = $db->prepare("INSERT INTO file_views (user_id, file_id, viewed_at) 
                                                  VALUES (?, ?, NOW())
                                                  ON DUPLICATE KEY UPDATE viewed_at = NOW()");
                        $insertStmt->execute([$user_id, $file['id']]);
                        $markedCount++;
                    }
                }
            }
        } elseif ($file_id) {
            // Mark specific file as viewed
            $insertStmt = $db->prepare("INSERT INTO file_views (user_id, file_id, viewed_at) 
                                      VALUES (?, ?, NOW())
                                      ON DUPLICATE KEY UPDATE viewed_at = NOW()");
            $insertStmt->execute([$user_id, $file_id]);
            $markedCount = 1;
        }
        
        echo json_encode([
            'success' => true,
            'marked_count' => $markedCount,
            'message' => $markedCount > 0 ? 'Files marked as viewed' : 'No files to mark'
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Mark File Viewed Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
