<?php
/**
 * Delete File API
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    // Accept POST, DELETE, or GET with id parameter
    $file_id = null;
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $file_id = $data['id'] ?? null;
    } elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE' || $_SERVER['REQUEST_METHOD'] === 'GET') {
        $file_id = $_GET['id'] ?? null;
    }
    
    if (!$file_id) {
        http_response_code(400);
        echo json_encode(['error' => 'File ID is required']);
        exit();
    }

    // Get file info first
    $stmt = $db->prepare("SELECT name, file_path, file_type, division_id, lobby_id, section FROM files WHERE id = ?");
    $stmt->execute([$file_id]);
    $file = $stmt->fetch();

    if ($file) {
        // Delete physical file if exists (for uploaded files)
        if ($file['file_type'] !== 'url' && $file['file_type'] !== 'html' && $file['file_type'] !== 'message') {
            $uploadDir = realpath(__DIR__ . '/../../uploads');
            $filePath = $uploadDir . '/' . $file['name'];
            if (file_exists($filePath)) {
                unlink($filePath);
            }
        }
        
        // Track file deletion for real-time sync before deleting
        try {
            $updateStmt = $db->prepare("INSERT INTO file_updates (file_id, action, target_division_id, target_lobby_id, target_section, created_by, created_at) VALUES (?, 'delete', ?, ?, ?, ?, NOW())");
            $updateStmt->execute([
                $file_id,
                $file['division_id'],
                $file['lobby_id'],
                $file['section'],
                $user_id ?? 0
            ]);
        } catch (Exception $e) {
            error_log("Failed to track file deletion: " . $e->getMessage());
        }
        
        // Delete from DB
        $delStmt = $db->prepare("DELETE FROM files WHERE id = ?");
        $delStmt->execute([$file_id]);
        
        // Also delete related file views
        try {
            $viewStmt = $db->prepare("DELETE FROM file_views WHERE file_id = ?");
            $viewStmt->execute([$file_id]);
        } catch (Exception $e) {
            error_log("Failed to delete file views: " . $e->getMessage());
        }
        
        // Trigger system update for real-time sync
        updateSystemModule($db, 'files');
        
        echo json_encode([
            'success' => true,
            'message' => 'File deleted successfully'
        ]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'File not found']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
