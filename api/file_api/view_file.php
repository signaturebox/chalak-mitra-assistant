<?php
/**
 * Track file views - marks files as read by users
 * Removes the "New" tag for the user
 */

require_once __DIR__ . '/../config/db_config.php';

header('Content-Type: application/json');

// Get request data
$data = json_decode(file_get_contents('php://input'), true);
$fileId = $data['file_id'] ?? '';
$userId = $data['user_id'] ?? '';

if (empty($fileId) || empty($userId)) {
    echo json_encode(['success' => false, 'error' => 'File ID and User ID required']);
    exit;
}

try {
    $pdo = getDBConnection();
    
    // Resolve user_id: Handle both numeric auto-increment ID and CMS ID
    $foundUserId = null;
    
    // 1. Try to find by auto-increment ID first (if numeric)
    if (is_numeric($userId)) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $userData = $stmt->fetch();
        if ($userData) $foundUserId = $userData['id'];
    }
    
    // 2. If not found by ID (or not numeric), try by CMS ID
    if (!$foundUserId) {
        $stmt = $pdo->prepare("SELECT id FROM users WHERE cms_id = ?");
        $stmt->execute([(string)$userId]);
        $userData = $stmt->fetch();
        if ($userData) {
            $foundUserId = $userData['id'];
        } else {
            echo json_encode(['success' => false, 'error' => 'User not found: ' . $userId]);
            exit();
        }
    }
    $userId = $foundUserId;
    
    // Ensure file_views table exists
    try {
        $pdo->exec("CREATE TABLE IF NOT EXISTS file_views (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            file_id INT NOT NULL,
            viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_file_view (user_id, file_id),
            KEY idx_user_id (user_id),
            KEY idx_file_id (file_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
    } catch (Exception $e) { /* Ignore */ }

    // Check if view already exists
    $checkStmt = $pdo->prepare("SELECT id FROM file_views WHERE file_id = ? AND user_id = ?");
    $checkStmt->execute([$fileId, $userId]);
    
    if ($checkStmt->rowCount() === 0) {
        // Insert new view record
        $insertStmt = $pdo->prepare("INSERT INTO file_views (file_id, user_id, viewed_at) VALUES (?, ?, NOW())");
        $insertStmt->execute([$fileId, $userId]);
    }
    
    echo json_encode(['success' => true, 'message' => 'File marked as viewed']);
    
} catch (PDOException $e) {
    error_log("[ViewFile] Error: " . $e->getMessage());
    echo json_encode(['success' => false, 'error' => 'Database error']);
}
