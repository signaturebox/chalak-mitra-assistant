<?php
/**
 * Get Popup Messages API
 * 
 * Returns active popups for the current user based on:
 * - Current date/time (between start and end datetime)
 * - User role
 * - User division/lobby
 * - Whether user has already seen the popup (if show_once is true)
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
        $include_all = isset($_GET['include_all']) && $_GET['include_all'] === 'true'; // For admin view
        
        // Initialize user variables
        $user_role = null;
        $user_division = null;
        $user_lobby = null;
        $divisionId = null;
        $lobbyId = null;
        
        // If user_id provided, get user details
        if ($user_id) {
            // Convert user_id from CMS ID if needed
            $originalUserId = $user_id;
            if (!is_numeric($user_id)) {
                $userStmt = $db->prepare("SELECT id, role, division, lobby FROM users WHERE cms_id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                if ($userData) {
                    $user_id = $userData['id'];
                    $user_role = $userData['role'];
                    $user_division = $userData['division'];
                    $user_lobby = $userData['lobby'];
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'User not found']);
                    exit();
                }
            } else {
                // Get user details
                $userStmt = $db->prepare("SELECT role, division, lobby FROM users WHERE id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                if ($userData) {
                    $user_role = $userData['role'];
                    $user_division = $userData['division'];
                    $user_lobby = $userData['lobby'];
                }
            }
            
            // Get division and lobby IDs
            if ($user_division) {
                $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR LOWER(name) = LOWER(?)");
                $divStmt->execute([$user_division, $user_division]);
                $divData = $divStmt->fetch();
                $divisionId = $divData ? $divData['id'] : null;
            }
            
            if ($user_lobby) {
                $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ? OR code = ?");
                $lobbyStmt->execute([$user_lobby, $user_lobby]);
                $lobbyData = $lobbyStmt->fetch();
                $lobbyId = $lobbyData ? $lobbyData['id'] : null;
            }
        }
        
        if ($include_all && $user_role && in_array($user_role, ['super', 'division'])) {
            // Admin view - get all popups with stats
            $sql = "SELECT pm.*, 
                           d.name as division_name, 
                           l.name as lobby_name,
                           u.name as created_by_name,
                           COUNT(DISTINCT pv.user_id) as view_count,
                           COUNT(DISTINCT pv.user_id) as unique_view_count,
                           pm.total_views
                    FROM popup_messages pm
                    LEFT JOIN divisions d ON pm.target_division_id = d.id
                    LEFT JOIN lobbies l ON pm.target_lobby_id = l.id
                    LEFT JOIN users u ON pm.created_by = u.id
                    LEFT JOIN popup_views pv ON pm.id = pv.popup_id
                    GROUP BY pm.id
                    ORDER BY pm.created_at DESC";
            
            $stmt = $db->prepare($sql);
            $stmt->execute();
            $popups = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'popups' => $popups,
                'count' => count($popups)
            ]);
            
        } else {
            // User view - get only active, targeted popups
            // For non-logged in users, only show popups with target_role = 'all' and no division/lobby restrictions
            $sql = "SELECT pm.*, d.name as division_name, l.name as lobby_name
                    FROM popup_messages pm
                    LEFT JOIN divisions d ON pm.target_division_id = d.id
                    LEFT JOIN lobbies l ON pm.target_lobby_id = l.id
                    LEFT JOIN popup_views pv ON pm.id = pv.popup_id AND pv.user_id = ?
                    WHERE pm.is_active = 1
                    AND pm.start_datetime <= NOW()
                    AND pm.end_datetime >= NOW()
                    AND (
                        pm.target_role = 'all'
                        OR (pm.target_role = 'crew' AND ? = 'crew')
                        OR (pm.target_role = 'lobby' AND ? = 'lobby')
                        OR (pm.target_role = 'division' AND ? = 'division')
                        OR (pm.target_role = 'super' AND ? = 'super')
                    )
                    AND (pm.target_division_id IS NULL OR pm.target_division_id = ? OR ? IS NULL)
                    AND (pm.target_lobby_id IS NULL OR pm.target_lobby_id = ? OR ? IS NULL)
                    AND (pm.show_once = 0 OR pv.id IS NULL OR ? IS NULL)
                    ORDER BY pm.created_at DESC
                    LIMIT 10";
            
            $stmt = $db->prepare($sql);
            $stmt->execute([
                $user_id ?? 0,
                $user_role, $user_role, $user_role, $user_role,
                $divisionId, $divisionId,
                $lobbyId, $lobbyId,
                $user_id // for show_once check - if no user_id, show popup
            ]);
            $popups = $stmt->fetchAll();
            
            // Mark popups as viewed (for show_once tracking) - only for logged in users
            if ($user_id) {
                foreach ($popups as $popup) {
                    if ($popup['show_once']) {
                        $viewStmt = $db->prepare("INSERT IGNORE INTO popup_views (user_id, popup_id, viewed_at) VALUES (?, ?, NOW())");
                        $viewStmt->execute([$user_id, $popup['id']]);
                    }
                }
            }
            
            echo json_encode([
                'success' => true,
                'popups' => $popups,
                'count' => count($popups),
                'user_info' => [
                    'division_id' => $divisionId,
                    'lobby_id' => $lobbyId,
                    'role' => $user_role,
                    'is_guest' => !$user_id
                ]
            ]);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Get Popups Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
