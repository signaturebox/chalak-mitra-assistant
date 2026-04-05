<?php
/**
 * Get Notification Counters V2 API
 * 
 * Returns hierarchical counter data for:
 * - Division level (e.g., Bikaner: 3 new files)
 * - Lobby level (e.g., BKN: 2 new files)
 * - Tab level (e.g., Safety Drive: 1 new file)
 * 
 * Hierarchical Structure:
 * Division -> Lobby -> Tab
 * Example: Bikaner(1) -> BKN(1) -> Safety Drive(1)
 */

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('Pragma: no-cache');
header('Expires: Sat, 26 Jul 1997 05:00:00 GMT');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

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
        
        // Resolve user_id: Handle both numeric auto-increment ID and CMS ID
        $foundUserId = null;
        $foundUserData = null;
        
        // 1. Try to find by auto-increment ID first (if numeric)
        if (is_numeric($user_id)) {
            $stmt = $db->prepare("SELECT id, role, division, lobby FROM users WHERE id = ?");
            $stmt->execute([$user_id]);
            $foundUserData = $stmt->fetch();
            if ($foundUserData) $foundUserId = $foundUserData['id'];
        }
        
        // 2. If not found by ID (or not numeric), try by CMS ID
        if (!$foundUserId) {
            $stmt = $db->prepare("SELECT id, role, division, lobby FROM users WHERE cms_id = ?");
            $stmt->execute([(string)$user_id]);
            $foundUserData = $stmt->fetch();
            if ($foundUserData) {
                $foundUserId = $foundUserData['id'];
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'User not found: ' . $user_id]);
                exit();
            }
        }
        
        // Populate variables from found user data
        $user_id = $foundUserId;
        $user_division = $user_division ?: ($foundUserData['division'] ?? null);
        $user_lobby = $user_lobby ?: ($foundUserData['lobby'] ?? null);
        $user_role = $foundUserData['role'] ?? 'crew';
        
        // Get user details if not provided
        if (!$user_division) {
            $userStmt = $db->prepare("SELECT division, lobby, role FROM users WHERE id = ?");
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch();
            if ($user) {
                $user_division = $user['division'];
                $user_lobby = $user_lobby ?: $user['lobby'];
                $user_role = $user['role'];
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
        
        // Check if file_views table exists, create if not
        $fileViewsExists = false;
        try {
            $db->query("SELECT 1 FROM file_views LIMIT 1");
            $fileViewsExists = true;
        } catch (Exception $e) {
            // Table doesn't exist, create it
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
                $fileViewsExists = true;
                error_log("[GetCountersV2] Created file_views table");
            } catch (Exception $createError) {
                error_log("[GetCountersV2] Failed to create file_views table: " . $createError->getMessage());
            }
        }
        
        // Default to showing files from the last 60 days as "new" if they haven't been viewed
        // This ensures badges persist until viewed, without showing extremely old content
        $newThreshold = date('Y-m-d H:i:s', strtotime('-60 days'));
        
        // We use $lastVisit only as a reference for the very oldest we care about
        $lastVisit = $newThreshold;

        
        // HIERARCHICAL COUNTERS
        // Structure: Division -> Lobby -> Tab
        
        // Debug logging
        error_log("[GetCountersV2] User: $user_id, Division: $divisionId ($divisionName), Lobby: $lobbyId ($lobbyName), FileViewsExists: " . ($fileViewsExists ? 'yes' : 'no'));
        
        // 1. DIVISION LEVEL COUNTER
        // Count all new files in user's division (across all lobbies and tabs)
        $divisionCount = 0;
        $divisionNewFiles = [];
        if ($divisionId) {
            if ($fileViewsExists) {
                $divCountSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at, 
                                       l.name as lobby_name, l.code as lobby_code
                               FROM files f
                               LEFT JOIN lobbies l ON f.lobby_id = l.id
                                WHERE f.is_active = 1
                               AND f.division_id = ?
                               AND f.uploaded_at > ?
                               AND f.file_type NOT IN ('html', 'message')
                               AND NOT EXISTS (
                                   SELECT 1 FROM file_views fv 
                                   WHERE fv.file_id = f.id AND fv.user_id = ?
                               ) group by f.id";
                $divCountStmt = $db->prepare($divCountSql);
                $divCountStmt->execute([$divisionId, $lastVisit, $user_id]);
            } else {
                // Fallback: count files uploaded in last 24 hours
                $divCountSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at, 
                                       l.name as lobby_name, l.code as lobby_code
                               FROM files f
                               LEFT JOIN lobbies l ON f.lobby_id = l.id
                               WHERE f.is_active = 1
                               AND f.division_id = ?
                               AND f.uploaded_at > ?";
                $divCountStmt = $db->prepare($divCountSql);
                $divCountStmt->execute([$divisionId, $newThreshold]);
            }
            $divisionFiles = $divCountStmt->fetchAll();
            $divisionCount = count($divisionFiles);
            $divisionNewFiles = $divisionFiles;
            
            error_log("[GetCountersV2] Division files found: $divisionCount, LastVisit: $lastVisit, NewThreshold: $newThreshold");
        }
        
        // 2. LOBBY LEVEL COUNTER
        // Count new files in user's specific lobby
        $lobbyCount = 0;
        $lobbyNewFiles = [];
        if ($lobbyId) {
            if ($fileViewsExists) {
                $lobbyCountSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at
                                 FROM files f
                                 WHERE f.is_active = 1
                                 AND f.lobby_id = ?
                                 AND f.uploaded_at > ?
                                 AND f.file_type NOT IN ('html', 'message')
                                 AND NOT EXISTS (
                                     SELECT 1 FROM file_views fv 
                                     WHERE fv.file_id = f.id AND fv.user_id = ?
                                 ) group by f.id";
                $lobbyCountStmt = $db->prepare($lobbyCountSql);
                $lobbyCountStmt->execute([$lobbyId, $lastVisit, $user_id]);
            } else {
                // Fallback: count files uploaded in last 24 hours
                $lobbyCountSql = "SELECT f.id, f.name, f.title, f.section, f.uploaded_at
                                 FROM files f
                                 WHERE f.is_active = 1
                                 AND f.lobby_id = ?
                                 AND f.uploaded_at > ?";
                $lobbyCountStmt = $db->prepare($lobbyCountSql);
                $lobbyCountStmt->execute([$lobbyId, $newThreshold]);
            }
            $lobbyFiles = $lobbyCountStmt->fetchAll();
            $lobbyCount = count($lobbyFiles);
            $lobbyNewFiles = $lobbyFiles;
        }
        
        // 3. TAB LEVEL COUNTERS
        // Count new files grouped by section/tab within division/lobby
        $tabCounters = [];
        if ($divisionId) {
            if ($fileViewsExists) {
                $tabSql = "SELECT f.section, COUNT(*) as count,
                                  GROUP_CONCAT(f.id) as file_ids,
                                  GROUP_CONCAT(COALESCE(f.title, f.name)) as file_names,
                                  MAX(f.uploaded_at) as latest_upload
                           FROM files f
                            WHERE f.is_active = 1
                           AND (
                               (f.division_id = ? OR f.lobby_id = ?) 
                               OR (f.division_id IS NULL AND f.lobby_id IS NULL)
                           )
                           AND f.uploaded_at > ?
                           AND f.file_type NOT IN ('html', 'message')
                           AND NOT EXISTS (
                               SELECT 1 FROM file_views fv 
                               WHERE fv.file_id = f.id AND fv.user_id = ?
                           )
                           AND f.section IS NOT NULL
                           GROUP BY f.section
                           ORDER BY latest_upload DESC";
                $tabStmt = $db->prepare($tabSql);
                $tabStmt->execute([$divisionId, $lobbyId, $lastVisit, $user_id]);
            } else {
                // Fallback: count files uploaded in last 24 hours
                $tabSql = "SELECT f.section, COUNT(*) as count,
                                  GROUP_CONCAT(f.id) as file_ids,
                                  GROUP_CONCAT(COALESCE(f.title, f.name)) as file_names,
                                  MAX(f.uploaded_at) as latest_upload
                           FROM files f
                           WHERE f.is_active = 1
                           AND (f.division_id = ? OR f.lobby_id = ?)
                           AND f.uploaded_at > ?
                           AND f.section IS NOT NULL
                           GROUP BY f.section
                           ORDER BY latest_upload DESC";
                $tabStmt = $db->prepare($tabSql);
                $tabStmt->execute([$divisionId, $lobbyId, $newThreshold]);
            }
            $tabCounters = $tabStmt->fetchAll();
        }
        
        // 4. GET ALL NEW FILE IDs FOR "NEW" BADGE
        // Division-level files: division_id matches but lobby_id IS NULL (not lobby-specific)
        // Lobby-level files: lobby_id matches user's lobby
        $newFileIds = [];
        if ($divisionId) {
            if ($fileViewsExists) {
                // Division-scope files (uploaded to division tab, visible to whole division)
                $newFilesSql = "SELECT f.id FROM files f
                               WHERE f.is_active = 1
                               AND f.division_id = ?
                               AND (f.lobby_id IS NULL OR f.lobby_id = 0)
                               AND f.uploaded_at > ?
                               AND NOT EXISTS (
                                   SELECT 1 FROM file_views fv
                                   WHERE fv.file_id = f.id AND fv.user_id = ?
                               )";
                $stmt1 = $db->prepare($newFilesSql);
                $stmt1->execute([$divisionId, $newThreshold, $user_id]);
                $newFileIds = $stmt1->fetchAll(PDO::FETCH_COLUMN);

                // Lobby-scope files (uploaded to this user's lobby tab)
                if ($lobbyId) {
                    $lobbyNewSql = "SELECT f.id FROM files f
                                   WHERE f.is_active = 1
                                   AND f.lobby_id = ?
                                   AND f.uploaded_at > ?
                                   AND NOT EXISTS (
                                       SELECT 1 FROM file_views fv
                                       WHERE fv.file_id = f.id AND fv.user_id = ?
                                   )";
                    $stmt2 = $db->prepare($lobbyNewSql);
                    $stmt2->execute([$lobbyId, $newThreshold, $user_id]);
                    $lobbyNewIds = $stmt2->fetchAll(PDO::FETCH_COLUMN);
                    $newFileIds = array_unique(array_merge($newFileIds, $lobbyNewIds));
                }

                // Main-tab files (no division, no lobby — visible to all)
                $mainNewSql = "SELECT f.id FROM files f
                              WHERE f.is_active = 1
                              AND (f.division_id IS NULL OR f.division_id = 0)
                              AND (f.lobby_id IS NULL OR f.lobby_id = 0)
                              AND f.uploaded_at > ?
                              AND NOT EXISTS (
                                  SELECT 1 FROM file_views fv
                                  WHERE fv.file_id = f.id AND fv.user_id = ?
                              )";
                $stmt3 = $db->prepare($mainNewSql);
                $stmt3->execute([$newThreshold, $user_id]);
                $mainNewIds = $stmt3->fetchAll(PDO::FETCH_COLUMN);
                $newFileIds = array_unique(array_merge($newFileIds, $mainNewIds));

            } else {
                // Fallback: get files uploaded in last 24 hours (no file_views table)
                $newFilesSql = "SELECT f.id FROM files f
                               WHERE f.is_active = 1
                               AND (
                                   (f.division_id = ? AND (f.lobby_id IS NULL OR f.lobby_id = 0))
                                   OR (f.lobby_id = ?)
                                   OR (f.division_id IS NULL AND f.lobby_id IS NULL)
                               )
                               AND f.uploaded_at > ?";
                $newFilesStmt = $db->prepare($newFilesSql);
                $newFilesStmt->execute([$divisionId, $lobbyId, $newThreshold]);
                $newFileIds = $newFilesStmt->fetchAll(PDO::FETCH_COLUMN);
            }
        }

        
        // 5. NOTIFICATION COUNT (unread system notifications)
        $unreadNotifSql = "SELECT COUNT(*) as count FROM notifications n
                          LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                          WHERE n.is_active = 1
                          AND (un.is_read IS NULL OR un.is_read = 0)
                          AND (un.is_dismissed IS NULL OR un.is_dismissed = 0)
                          AND (
                              (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                              OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                              OR (n.target_lobby_id = ?)
                          )";
        $unreadNotifStmt = $db->prepare($unreadNotifSql);
        $unreadNotifStmt->execute([$user_id, $divisionId, $lobbyId]);
        $unreadNotifications = (int)$unreadNotifStmt->fetch()['count'];
        
        // 6. BUILD HIERARCHICAL RESPONSE
        // Structure: divisions[divisionName] -> lobbies[lobbyName] -> tabs[tabName] = count
        $hierarchy = [];
        
        // Group files by lobby and tab
        foreach ($divisionNewFiles as $file) {
            $lobby = $file['lobby_name'] ?? 'General';
            $section = $file['section'] ?? 'General';
            
            if (!isset($hierarchy[$lobby])) {
                $hierarchy[$lobby] = [
                    'count' => 0,
                    'tabs' => []
                ];
            }
            if (!isset($hierarchy[$lobby]['tabs'][$section])) {
                $hierarchy[$lobby]['tabs'][$section] = 0;
            }
            
            $hierarchy[$lobby]['count']++;
            $hierarchy[$lobby]['tabs'][$section]++;
        }
        
        // Update last counter check timestamp
        try {
            $cacheStmt = $db->prepare("INSERT INTO notification_counters 
                                      (user_id, division_count, lobby_count, tab_count, last_updated) 
                                      VALUES (?, ?, ?, ?, NOW())
                                      ON DUPLICATE KEY UPDATE 
                                      division_count = VALUES(division_count),
                                      lobby_count = VALUES(lobby_count),
                                      tab_count = VALUES(tab_count),
                                      last_updated = NOW()");
            $cacheStmt->execute([$user_id, $divisionCount, $lobbyCount, count($tabCounters)]);
        } catch (Exception $e) {
            error_log("Failed to update counter cache: " . $e->getMessage());
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
                'notifications' => $unreadNotifications,
                'total_new_files' => $divisionCount + $lobbyCount,
                'new_file_ids' => $newFileIds
            ],
            'hierarchy' => $hierarchy,
            'last_visit' => $lastVisit,
            'new_threshold' => $newThreshold,
            'user_info' => [
                'division_id' => $divisionId,
                'division_name' => $divisionName,
                'lobby_id' => $lobbyId,
                'lobby_name' => $lobbyName
            ]
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Get Counters V2 Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
