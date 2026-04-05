<?php
/**
 * Batch File Fetch API
 * 
 * Fetches files for multiple tabs/sections in a single request
 * for improved performance when loading division details.
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
        
        $sections = $data['sections'] ?? []; // Array of section names
        $division_id = $data['division_id'] ?? null;
        $user_id = $data['user_id'] ?? null;
        
        if (empty($sections)) {
            http_response_code(400);
            echo json_encode(['error' => 'No sections specified']);
            exit();
        }
        
        // Convert user_id from CMS if needed
        $userDbId = null;
        if ($user_id) {
            if (!is_numeric($user_id)) {
                $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
                $userStmt->execute([$user_id]);
                $userData = $userStmt->fetch();
                if ($userData) {
                    $userDbId = $userData['id'];
                }
            } else {
                $userDbId = $user_id;
            }
        }
        
        // Build placeholders for IN clause
        $placeholders = implode(',', array_fill(0, count($sections), '?'));
        
        // Fetch files for all sections in one query
        $sql = "SELECT f.*, 
                       u.name as uploaded_by_name,
                       d.name as division_name,
                       l.name as lobby_name,
                       CASE WHEN fv.id IS NOT NULL THEN 0 ELSE 1 END as is_new
                FROM files f
                LEFT JOIN users u ON f.uploaded_by = u.id
                LEFT JOIN divisions d ON f.division_id = d.id
                LEFT JOIN lobbies l ON f.lobby_id = l.id
                LEFT JOIN file_views fv ON f.id = fv.file_id AND fv.user_id = ?
                WHERE f.section IN ($placeholders)";
        
        $params = [$userDbId ?: 0];
        $params = array_merge($params, $sections);
        
        if ($division_id) {
            $sql .= " AND f.division_id = ?";
            $params[] = $division_id;
        }
        
        $sql .= " ORDER BY f.uploaded_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $files = $stmt->fetchAll();
        
        // Group files by section
        $filesBySection = [];
        foreach ($sections as $section) {
            $filesBySection[$section] = [];
        }
        
        foreach ($files as $file) {
            $section = $file['section'];
            if (!isset($filesBySection[$section])) {
                $filesBySection[$section] = [];
            }
            $filesBySection[$section][] = $file;
        }
        
        echo json_encode([
            'success' => true,
            'files_by_section' => $filesBySection,
            'total_files' => count($files),
            'sections' => count($filesBySection)
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Batch Files Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
