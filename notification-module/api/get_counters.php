<?php
/**
 * Get Notification Counters API
 * 
 * Returns hierarchical counter data for:
 * - Division level
 * - Lobby level  
 * - Tab level
 * - New file IDs for "New" badges
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../../../../api/config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        $user_division = $_GET['division'] ?? null;
        $user_lobby = $_GET['lobby'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }
        
        // Convert user_id if it's a CMS ID
        if (!is_numeric($user_id)) {
            $userLookup = $db->prepare("SELECT id, role, division, lobby FROM users WHERE cms_id = ?");
            $userLookup->execute([$user_id]);
            $userData = $userLookup->fetch();
            if ($userData) {
                $user_id = $userData['id'];
                $user_division = $user_division ?: $userData['division'];
                $user_lobby = $user_lobby ?: $userData['lobby'];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found']);
                exit();
            }
        }
        
        // Get user details
        if (!$user_division) {
            $userStmt = $db->prepare("SELECT division, lobby, role FROM users WHERE id = ?");
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch();
            if ($user) {
                $user_division = $user['division'];
                $user_lobby = $user_lobby ?: $user['lobby'];
            }
        }
        
        // Get division ID
        $divisionId = null;
        $divisionName = null;
        if ($user_division) {
            $divStmt = $db->prepare("SELECT id, name FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$user_division, $user_division]);
            $divData = $divStmt->fetch();
            $divisionId = $divData ? $divData['id'] : null;
            $divisionName = $divData ? $divData['name'] : $user_division;
        }
        
        // Get lobby ID
        $lobbyId = null;
        $lobbyName = null;
        if ($user_lobby) {
            $lobbyStmt = $db->prepare("SELECT id, name FROM lobbies WHERE name = ? OR code = ?");
            $lobbyStmt->execute([$user_lobby, $user_lobby]);
            $lobbyData = $lobbyStmt->fetch();
            $lobbyId = $lobbyData ? $lobbyData['id'] : null;
            $lobbyName = $lobbyData ? $lobbyData['name'] : $user_lobby;
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
        
        // Get last visit time
        $lastVisit = date('Y-m-d H:i:s', strtotime('-24 hours'));
        try {
            $lastVisitStmt = $db->prepare("SELECT MAX(viewed_at) as last_visit FROM file_views WHERE user_id = ?");
            $lastVisitStmt->execute([$user_id]);
            $lastVisitData = $lastVisitStmt->fetch();
            if ($lastVisitData['last_visit']) {
                $lastVisit = max($lastVisitData['last_visit'], date('Y-m-d H:i:s', strtotime('-24 hours')));
            }
        } catch (Exception $e) {
            // Table might not exist
        }
        
        $newThreshold = date('Y-m-d H:i:s', strtotime('-24 hours'));
        
        // 1. DIVISION LEVEL COUNTER
        $divisionCount = 0;
        $divisionFiles = [];
        if ($divisionId) {
            $divSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at, 
                              l.name as lobby_name, l.code as lobby_code
                       FROM files f
                       LEFT JOIN lobbies l ON f.lobby_id = l.id
                       WHERE f.is_active = 1
                       AND f.division_id = ?
                       AND f.uploaded_at > ?
                       AND NOT EXISTS (
                           SELECT 1 FROM file_views fv 
                           WHERE fv.file_id = f.id AND fv.user_id = ?
                       )";
            $divStmt = $db->prepare($divSql);
            $divStmt->execute([$divisionId, $lastVisit, $user_id]);
            $divisionFiles = $divStmt->fetchAll();
            $divisionCount = count($divisionFiles);
        }
        
        // 2. LOBBY LEVEL COUNTER
        $lobbyCount = 0;
        $lobbyFiles = [];
        if ($lobbyId) {
            $lobbySql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at
                         FROM files f
                         WHERE f.is_active = 1
                         AND f.lobby_id = ?
                         AND f.uploaded_at > ?
                         AND NOT EXISTS (
                             SELECT 1 FROM file_views fv 
                             WHERE fv.file_id = f.id AND fv.user_id = ?
                         )";
            $lobbyStmt = $db->prepare($lobbySql);
            $lobbyStmt->execute([$lobbyId, $lastVisit, $user_id]);
            $lobbyFiles = $lobbyStmt->fetchAll();
            $lobbyCount = count($lobbyFiles);
        }
        
        // 3. TAB LEVEL COUNTERS
        $tabCounters = [];
        if ($divisionId) {
            $tabSql = "SELECT f.section, COUNT(*) as count,
                              GROUP_CONCAT(f.id) as file_ids,
                              MAX(f.uploaded_at) as latest_upload
                       FROM files f
                       WHERE f.is_active = 1
                       AND (f.division_id = ? OR f.lobby_id = ?)
                       AND f.uploaded_at > ?
                       AND NOT EXISTS (
                           SELECT 1 FROM file_views fv 
                           WHERE fv.file_id = f.id AND fv.user_id = ?
                       )
                       AND f.section IS NOT NULL
                       GROUP BY f.section
                       ORDER BY latest_upload DESC";
            $tabStmt = $db->prepare($tabSql);
            $tabStmt->execute([$divisionId, $lobbyId, $lastVisit, $user_id]);
            $tabCounters = $tabStmt->fetchAll();
        }
        
        // 4. NEW FILE IDs
        $newFileIds = [];
        if ($divisionId) {
            $newFilesSql = "SELECT f.id
                           FROM files f
                           WHERE f.is_active = 1
                           AND (f.division_id = ? OR f.lobby_id = ?)
                           AND f.uploaded_at > ?
                           AND NOT EXISTS (
                               SELECT 1 FROM file_views fv 
                               WHERE fv.file_id = f.id AND fv.user_id = ?
                           )";
            $newFilesStmt = $db->prepare($newFilesSql);
            $newFilesStmt->execute([$divisionId, $lobbyId, $newThreshold, $user_id]);
            $newFileIds = $newFilesStmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        // 5. BUILD HIERARCHY
        $hierarchy = [];
        foreach ($divisionFiles as $file) {
            $lobby = $file['lobby_name'] ?? 'General';
            $section = $file['section'] ?? 'General';
            
            if (!isset($hierarchy[$lobby])) {
                $hierarchy[$lobby] = ['count' => 0, 'tabs' => []];
            }
            if (!isset($hierarchy[$lobby]['tabs'][$section])) {
                $hierarchy[$lobby]['tabs'][$section] = 0;
            }
            
            $hierarchy[$lobby]['count']++;
            $hierarchy[$lobby]['tabs'][$section]++;
        }
        
        // 6. NOTIFICATION COUNT
        $unreadNotifCount = 0;
        try {
            $notifSql = "SELECT COUNT(*) as count FROM notifications n
                        LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                        WHERE n.is_active = 1
                        AND (un.is_read IS NULL OR un.is_read = 0)
                        AND (
                            (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                            OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                            OR (n.target_lobby_id = ?)
                        )";
            $notifStmt = $db->prepare($notifSql);
            $notifStmt->execute([$user_id, $divisionId, $lobbyId]);
            $unreadNotifCount = (int)$notifStmt->fetch()['count'];
        } catch (Exception $e) {
            // Table might not exist
        }
        
        echo json_encode([
            'success' => true,
            'counters' => [
                'division' => [
                    'count' => $divisionCount,
                    'name' => $divisionName,
                    'id' => $divisionId
                ],
                'lobby' => [
                    'count' => $lobbyCount,
                    'name' => $lobbyName,
                    'id' => $lobbyId
                ],
                'tabs' => $tabCounters,
                'notifications' => $unreadNotifCount,
                'total_new_files' => $divisionCount + $lobbyCount,
                'new_file_ids' => $newFileIds
            ],
            'hierarchy' => $hierarchy,
            'last_visit' => $lastVisit,
            'new_threshold' => $newThreshold
        ]);
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Get Counters Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
