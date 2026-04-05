<?php
/**
 * Get Files API
 */

// Set JSON header immediately
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $division_id = $_GET['division_id'] ?? null;
        $lobby_id = $_GET['lobby_id'] ?? null;
        $section = $_GET['section'] ?? null;
        $user_id = $_GET['user_id'] ?? null;
        
        // Build query based on filters
        $sql = "SELECT f.id, f.name, f.original_name, f.title, f.description, f.file_type, f.file_path, f.file_size, f.section, f.category, f.division_id, f.lobby_id, f.uploaded_at, u.name as uploaded_by_name, d.name as division_name, l.name as lobby_name
        FROM files f
                LEFT JOIN users u ON f.uploaded_by = u.id
                LEFT JOIN divisions d ON f.division_id = d.id
                LEFT JOIN lobbies l ON f.lobby_id = l.id
                WHERE f.is_active = 1";
        
        $params = [];
        $conditions = [];
        
        if ($division_id) {
            $conditions[] = "f.division_id = ?";
            $params[] = $division_id;
        }
        
        if ($lobby_id) {
            $conditions[] = "f.lobby_id = ?";
            $params[] = $lobby_id;
        }
        
        // Handle admin file visibility
        if ($user_id) {
            // Check if user is admin
            $adminCheck = $db->prepare("SELECT role, division, lobby FROM users WHERE id = ?");
            $adminCheck->execute([$user_id]);
            $user = $adminCheck->fetch();
            
            if ($user && in_array($user['role'], ['super', 'division', 'lobby'])) {
                // If admin, we might want to relax filtering or allow seeing all uploaded files by them
                // However, the current logic only filters by division/lobby if provided.
                // If division_id is NOT provided, admins might want to see everything or just their uploads?
                
                // If no filters provided, show files uploaded by this admin OR files relevant to their scope
                if (!$division_id && !$lobby_id && !$section) {
                    if ($user['role'] === 'super') {
                        // Super admin sees all files (already handled if no conditions added)
                    } elseif ($user['role'] === 'division') {
                        // Division admin sees files in their division
                        // Find division ID for user's division code
                        $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ?");
                        $divStmt->execute([$user['division']]);
                        $divId = $divStmt->fetchColumn();
                        
                        if ($divId) {
                            $conditions[] = "(f.division_id = ? OR f.uploaded_by = ?)";
                            $params[] = $divId;
                            $params[] = $user_id;
                        }
                    } elseif ($user['role'] === 'lobby') {
                        // Lobby admin sees files in their lobby
                        // Find lobby ID
                        $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE name = ?");
                        $lobbyStmt->execute([$user['lobby']]);
                        $lobbyId = $lobbyStmt->fetchColumn();
                        
                        if ($lobbyId) {
                            $conditions[] = "(f.lobby_id = ? OR f.uploaded_by = ?)";
                            $params[] = $lobbyId;
                            $params[] = $user_id;
                        }
                    }
                }
            }
        }
        
        if ($section) {
            $conditions[] = "f.section = ?";
            $params[] = $section;
        }
        
        if (!empty($conditions)) {
            $sql .= " AND " . implode(" AND ", $conditions);
        }
        
        $sql .= " ORDER BY f.uploaded_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $files = $stmt->fetchAll();
        
        // Get viewed files for this user
        $viewedFiles = [];
        if ($user_id) {
            $viewStmt = $db->prepare("SELECT file_id FROM file_views WHERE user_id = ?");
            $viewStmt->execute([$user_id]);
            $viewedFiles = $viewStmt->fetchAll(PDO::FETCH_COLUMN);
        }
        
        // Format file sizes and check if new
        foreach ($files as &$file) {
            $file['file_size_formatted'] = formatFileSize($file['file_size']);
            // File is "New" if uploaded within last 72 hours (3 days) and not viewed by this user
            $isNew = false;
            if ($file['uploaded_at']) {
                $uploadTime = strtotime($file['uploaded_at']);
                $isWithin72Hours = (time() - $uploadTime) < (72 * 60 * 60); // 3 days
                $isNotViewed = !in_array($file['id'], $viewedFiles);
                $isNew = $isWithin72Hours && $isNotViewed;
            }
            $file['is_new'] = $isNew;
        }

        
        echo json_encode([
            'success' => true,
            'files' => $files,
            'count' => count($files)
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

// Helper function to format file size
function formatFileSize($size) {
    $units = ['B', 'KB', 'MB', 'GB'];
    $unit = 0;
    
    while ($size >= 1024 && $unit < count($units) - 1) {
        $size /= 1024;
        $unit++;
    }
    
    return round($size, 2) . ' ' . $units[$unit];
}
?>