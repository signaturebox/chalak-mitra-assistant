<?php
/**
 * Get Notification Counters API
 * 
 * Returns hierarchical counter data for:
 * - Division level (e.g., Bikaner: 3 new files)
 * - Lobby level (e.g., BKN: 2 new files)
 * - Tab level (e.g., Safety Drive: 1 new file)
 */

header('Content-Type: application/json; charset=utf-8');
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
        
        // If user_id is not numeric, convert from cms_id
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
        
        // Get user details if not provided
        if (!$user_division) {
            $userStmt = $db->prepare("SELECT division, lobby FROM users WHERE id = ?");
            $userStmt->execute([$user_id]);
            $user = $userStmt->fetch();
            if ($user) {
                $user_division = $user['division'];
                $user_lobby = $user_lobby ?: $user['lobby'];
            }
        }
        
        // Get division ID
        $divisionId = null;
        if ($user_division) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
            $divStmt->execute([$user_division, $user_division]);
            $divData = $divStmt->fetch();
            $divisionId = $divData ? $divData['id'] : null;
        }
        
        // Get lobby ID
        $lobbyId = null;
        if ($user_lobby) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
            $lobbyStmt->execute([$user_lobby, $user_lobby]);
            $lobbyData = $lobbyStmt->fetch();
            $lobbyId = $lobbyData ? $lobbyData['id'] : null;
        }
        
        // Get the timestamp of the user's last visit/refresh
        $lastVisitStmt = $db->prepare("SELECT MAX(viewed_at) as last_visit FROM file_views WHERE user_id = ?");
        $lastVisitStmt->execute([$user_id]);
        $lastVisitData = $lastVisitStmt->fetch();
        $lastVisit = $lastVisitData['last_visit'] ?? date('Y-m-d H:i:s', strtotime('-7 days'));
        
        // Count new files at division level
        $divisionCount = 0;
        if ($divisionId) {
            $divCountSql = "SELECT COUNT(*) as count FROM files f
                           WHERE f.is_active = 1
                           AND f.division_id = ?
                           AND f.uploaded_at > ?
                           AND NOT EXISTS (
                               SELECT 1 FROM file_views fv 
                               WHERE fv.file_id = f.id AND fv.user_id = ?
                           )";
            $divCountStmt = $db->prepare($divCountSql);
            $divCountStmt->execute([$divisionId, $lastVisit, $user_id]);
            $divisionCount = (int)$divCountStmt->fetch()['count'];
        }
        
        // Count new files at lobby level
        $lobbyCount = 0;
        if ($lobbyId) {
            $lobbyCountSql = "SELECT COUNT(*) as count FROM files f
                             WHERE f.is_active = 1
                             AND f.lobby_id = ?
                             AND f.uploaded_at > ?
                             AND NOT EXISTS (
                                 SELECT 1 FROM file_views fv 
                                 WHERE fv.file_id = f.id AND fv.user_id = ?
                             )";
            $lobbyCountStmt = $db->prepare($lobbyCountSql);
            $lobbyCountStmt->execute([$lobbyId, $lastVisit, $user_id]);
            $lobbyCount = (int)$lobbyCountStmt->fetch()['count'];
        }
        
        // Get tab-level counters (files grouped by section/tab)
        $tabCounters = [];
        if ($divisionId) {
            $tabSql = "SELECT f.section, COUNT(*) as count 
                      FROM files f
                      WHERE f.is_active = 1
                      AND (f.division_id = ? OR f.lobby_id = ?)
                      AND f.uploaded_at > ?
                      AND NOT EXISTS (
                          SELECT 1 FROM file_views fv 
                          WHERE fv.file_id = f.id AND fv.user_id = ?
                      )
                      AND f.section IS NOT NULL
                      GROUP BY f.section";
            $tabStmt = $db->prepare($tabSql);
            $tabStmt->execute([$divisionId, $lobbyId, $lastVisit, $user_id]);
            $tabCounters = $tabStmt->fetchAll();
        }
        
        // Get unread notification count
        $unreadNotifSql = "SELECT COUNT(*) as count FROM notifications n
                          LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
                          WHERE n.is_active = 1
                          AND (un.is_read IS NULL OR un.is_read = 0)
                          AND (
                              (n.target_division_id IS NULL AND n.target_lobby_id IS NULL)
                              OR (n.target_division_id = ? AND n.target_lobby_id IS NULL)
                              OR (n.target_lobby_id = ?)
                          )";
        $unreadNotifStmt = $db->prepare($unreadNotifSql);
        $unreadNotifStmt->execute([$user_id, $divisionId, $lobbyId]);
        $unreadNotifications = (int)$unreadNotifStmt->fetch()['count'];
        
        // Get detailed counters by division (for admin views)
        $divisionDetails = [];
        if (!$divisionId) {
            // Super admin - get all divisions
            $divDetailsSql = "SELECT d.id, d.name, d.code,
                                    COUNT(DISTINCT f.id) as file_count,
                                    COUNT(DISTINCT CASE WHEN f.uploaded_at > ? AND NOT EXISTS (
                                        SELECT 1 FROM file_views fv WHERE fv.file_id = f.id AND fv.user_id = ?
                                    ) THEN f.id END) as new_count
                             FROM divisions d
                             LEFT JOIN files f ON f.division_id = d.id AND f.is_active = 1
                             GROUP BY d.id, d.name, d.code";
            $divDetailsStmt = $db->prepare($divDetailsSql);
            $divDetailsStmt->execute([$lastVisit, $user_id]);
            $divisionDetails = $divDetailsStmt->fetchAll();
        }
        
        // Get detailed counters by lobby (for division admins)
        $lobbyDetails = [];
        if ($divisionId) {
            $lobbyDetailsSql = "SELECT l.id, l.name, l.code,
                                       COUNT(DISTINCT f.id) as file_count,
                                       COUNT(DISTINCT CASE WHEN f.uploaded_at > ? AND NOT EXISTS (
                                           SELECT 1 FROM file_views fv WHERE fv.file_id = f.id AND fv.user_id = ?
                                       ) THEN f.id END) as new_count
                                FROM lobbies l
                                LEFT JOIN files f ON f.lobby_id = l.id AND f.is_active = 1
                                WHERE l.division_id = ?
                                GROUP BY l.id, l.name, l.code";
            $lobbyDetailsStmt = $db->prepare($lobbyDetailsSql);
            $lobbyDetailsStmt->execute([$lastVisit, $user_id, $divisionId]);
            $lobbyDetails = $lobbyDetailsStmt->fetchAll();
        }
        
        // Update or insert counter cache
        try {
            $cacheStmt = $db->prepare("INSERT INTO notification_counters (user_id, division_count, lobby_count, tab_count, last_updated) 
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
                'division' => $divisionCount,
                'lobby' => $lobbyCount,
                'tabs' => $tabCounters,
                'notifications' => $unreadNotifications,
                'total_new_files' => $divisionCount + $lobbyCount
            ],
            'details' => [
                'divisions' => $divisionDetails,
                'lobbies' => $lobbyDetails
            ],
            'last_visit' => $lastVisit,
            'user_info' => [
                'division_id' => $divisionId,
                'lobby_id' => $lobbyId
            ]
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
