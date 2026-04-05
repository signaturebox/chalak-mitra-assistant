<?php
ob_start();
/**
 * Content Upload API - For URL links and HTML content
 * Handles file types that don't require actual file upload
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/upload_errors.log');
error_reporting(E_ALL);

// Custom error handler
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if (!(error_reporting() & $errno)) return false;
    error_log("PHP Error [$errno]: $errstr in $errfile on line $errline");
    if (ob_get_length()) ob_clean();
    http_response_code(500);
    echo json_encode(['error' => "PHP Error: $errstr"]);
    exit();
});

try {
    require_once '../config/db_config.php';
    $db = getDBConnection();
    
    // Auto-migrate: Ensure columns can store large JSON content
    // This runs once and is fast (no-op if already correct)
    try {
        $db->exec("ALTER TABLE files MODIFY COLUMN original_name LONGTEXT");
        $db->exec("ALTER TABLE files MODIFY COLUMN file_path LONGTEXT");
        error_log("Database columns updated to LONGTEXT");
    } catch (Exception $e) {
        // Ignore if already correct type or other error
        error_log("Column migration note: " . $e->getMessage());
    }
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Check if category column exists, if not add it
        try {
            $checkCol = $db->query("SHOW COLUMNS FROM files LIKE 'category'");
            if (!$checkCol->fetch()) {
                $db->exec("ALTER TABLE files ADD COLUMN category VARCHAR(50) DEFAULT NULL AFTER section");
            }
        } catch (Exception $e) {
            // Ignore error if column check fails, try to proceed
            error_log("Column check/add failed: " . $e->getMessage());
        }

        // Get JSON input
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            // Try form data
            $input = $_POST;
        }
        
        $user_id = $input['user_id'] ?? null;
        $division_id = !empty($input['division_id']) ? $input['division_id'] : null;
        $lobby_id = !empty($input['lobby_id']) ? $input['lobby_id'] : null;
        $section = !empty($input['section']) ? $input['section'] : null;
        $category = !empty($input['category']) ? $input['category'] : null;
        $title = !empty($input['title']) ? $input['title'] : 'Untitled';
        $description = $input['description'] ?? '';
        $file_type = $input['file_type'] ?? 'url'; // url, html, message
        $content = $input['content'] ?? null; // URL or HTML content
        $url = $input['url'] ?? null;
        
        error_log("Content Upload: user_id=$user_id, division_id=$division_id, section=$section, category=$category, type=$file_type");
        
        // Validate user
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }

        // If user_id is not numeric, find actual ID
        if (!is_numeric($user_id)) {
            $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $userStmt->execute([$user_id]);
            $userData = $userStmt->fetch();
            if ($userData) {
                $user_id = $userData['id'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid User ID: ' . $user_id]);
                exit();
            }
        }
        
        // Validate content (notices don't require content or URL - they use title and description only)
        if ($file_type !== 'notice' && !$content && !$url) {
            http_response_code(400);
            echo json_encode(['error' => 'Content or URL is required']);
            exit();
        }
        
        // For message/html/notice, content contains JSON - prefer it over empty URL
        // Use content for message/html/notice types, URL for url type
        if ($file_type === 'message' || $file_type === 'html' || $file_type === 'notice') {
            $file_content = $content; // Use JSON content directly
        } else {
            $file_content = $url ?: $content;
        }
        
        error_log("Content Upload - file_type: $file_type, content_length: " . strlen($file_content));
        
        // Convert division_id if string
        if ($division_id && !is_numeric($division_id)) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR name = ?");
            $divStmt->execute([$division_id, $division_id]);
            $divData = $divStmt->fetch();
            if ($divData) $division_id = $divData['id'];
        }

        // Convert lobby_id if string
        if ($lobby_id && !is_numeric($lobby_id)) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE code = ? OR name = ?");
            $lobbyStmt->execute([$lobby_id, $lobby_id]);
            $lobbyData = $lobbyStmt->fetch();
            if ($lobbyData) $lobby_id = $lobbyData['id'];
        }
        
        // Generate a unique identifier for this content
        $content_name = uniqid('content_') . '_' . time();
        
        // For HTML/message content, store JSON content directly in database
        // We use LONGTEXT column so no need to save to file
        $file_path = $file_content;
        
        // Calculate size (for URLs, just store URL length)
        $file_size = strlen($file_content);
        
        // Insert record into database
        $stmt = $db->prepare("INSERT INTO `files` (name, original_name, title, file_path, file_type, file_size, division_id, lobby_id, section, category, uploaded_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        
        $result = $stmt->execute([
            $content_name,          // name (unique identifier)
            $file_content,          // original_name (URL or content reference)
            $title,                 // title
            $file_path ?: $file_content, // file_path (or URL for url type)
            $file_type,             // file_type (url, html, message)
            $file_size,             // file_size
            $division_id,           // division_id
            $lobby_id,              // lobby_id
            $section,               // section
            $category,              // category
            $user_id,               // uploaded_by
            $description            // description
        ]);
        
        if ($result) {
            $newFileId = $db->lastInsertId();
            $message = ($file_type === 'notice') ? 'Notice posted successfully' : 'Content saved successfully';
            
            // System updates and push notifications are now handled by contentManagement.js 
            // calling create_notification.php to prevent duplicates.
            /*
            try {
                require_once '../notifications/push_notifier.php';
                
                $pushTitle = "New 📋 " . ucfirst($file_type) . ": " . $title;
                $pushMessage = "A new 📋 " . $file_type . " has been added to " . ($section ?: "General");
                
                sendPushToTargetUsers($db, $pushTitle, $pushMessage, $division_id, $lobby_id, [
                    'file_id' => $newFileId,
                    'type' => 'content_upload',
                    'file_type' => $file_type,
                    'tab_id' => $section
                ]);
            } catch (Exception $pushError) {
                error_log("Push error in content_upload: " . $pushError->getMessage());
            }
            */

            echo json_encode([
                'success' => true,
                'message' => $message,
                'file_id' => $newFileId,
                'file_name' => $content_name,
                'file_type' => $file_type
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save content record']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Content Upload Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
} finally {
    if (ob_get_length()) ob_end_flush();
}
?>
