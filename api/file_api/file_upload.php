<?php
ob_start();
/**
 * File Upload API
 */

// Set JSON header immediately
header('Content-Type: application/json; charset=utf-8');

// Disable error display to prevent HTML output in JSON response
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
    echo json_encode([
        'error' => "PHP Error: $errstr",
        'debug' => ['file' => $errfile, 'line' => $errline]
    ]);
    exit();
});

// Custom fatal error handler
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && ($error['type'] === E_ERROR || $error['type'] === E_PARSE || $error['type'] === E_CORE_ERROR || $error['type'] === E_COMPILE_ERROR)) {
        error_log("Fatal Error: {$error['message']} in {$error['file']} on line {$error['line']}");
        if (ob_get_length()) ob_clean();
        http_response_code(500);
        echo json_encode([
            'error' => "Fatal Error: {$error['message']}",
            'debug' => ['file' => $error['file'], 'line' => $error['line']]
        ]);
    }
});

try {
    if (!file_exists('../config/db_config.php')) {
        throw new Exception("Config file not found: ../config/db_config.php");
    }
    require_once '../config/db_config.php';

    $db = getDBConnection();
    
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

        // Handle file upload
        if (!isset($_FILES['file'])) {
            http_response_code(400);
            echo json_encode(['error' => 'No file uploaded']);
            exit();
        }
        
        $file = $_FILES['file'];
        $user_id = $_POST['user_id'] ?? null;
        $division_id = !empty($_POST['division_id']) ? $_POST['division_id'] : null;
        $lobby_id = !empty($_POST['lobby_id']) ? $_POST['lobby_id'] : null;
        $section = !empty($_POST['section']) ? $_POST['section'] : null;
        $category = !empty($_POST['category']) ? $_POST['category'] : null;
        $title = !empty($_POST['title']) ? $_POST['title'] : null;
        $description = $_POST['description'] ?? '';
        
        // Debug parameters
        error_log("Upload Params: user_id=$user_id, division_id=$division_id, lobby_id=$lobby_id, section=$section, category=$category, title=$title");
        
        // Validate user
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }

        // If user_id is not numeric, try to find the actual ID from cms_id
        if (!is_numeric($user_id)) {
            $userStmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
            $userStmt->execute([$user_id]);
            $userData = $userStmt->fetch();
            if ($userData) {
                $user_id = $userData['id'];
            } else {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid User ID or CMS ID: ' . $user_id]);
                exit();
            }
        }
        
        // Validate file
        if ($file['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['error' => 'File upload error: ' . $file['error']]);
            exit();
        }
        
        // Validate file type and size
        $allowed_types = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png', 'gif'];
        $max_size = 10 * 1024 * 1024; // 10MB
        
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($file_ext, $allowed_types)) {
            http_response_code(400);
            echo json_encode(['error' => 'File type not allowed']);
            exit();
        }
        
        if ($file['size'] > $max_size) {
            http_response_code(400);
            echo json_encode(['error' => 'File size exceeds 10MB limit']);
            exit();
        }
        
        // Validate and convert division_id/lobby_id if they are strings
        if ($division_id && !is_numeric($division_id)) {
            $divStmt = $db->prepare("SELECT id FROM divisions WHERE code = ? OR name = ?");
            $divStmt->execute([$division_id, $division_id]);
            $divData = $divStmt->fetch();
            if ($divData) $division_id = $divData['id'];
        }

        if ($lobby_id && !is_numeric($lobby_id)) {
            $lobbyStmt = $db->prepare("SELECT id FROM lobbies WHERE code = ? OR name = ?");
            $lobbyStmt->execute([$lobby_id, $lobby_id]);
            $lobbyData = $lobbyStmt->fetch();
            if ($lobbyData) $lobby_id = $lobbyData['id'];
        }

        // Create upload directory
        $upload_dir = realpath(__DIR__ . '/../../') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
        if (!file_exists($upload_dir)) {
            if (!mkdir($upload_dir, 0755, true)) {
                http_response_code(500);
                echo json_encode(['error' => 'Failed to create upload directory: ' . $upload_dir]);
                exit();
            }
        }

        if (!is_writable($upload_dir)) {
            http_response_code(500);
            echo json_encode(['error' => 'Upload directory is not writable: ' . $upload_dir]);
            exit();
        }
        
        // Generate unique filename
        $file_name = uniqid() . '_' . basename($file['name']);
        $file_path = $upload_dir . $file_name;
        
        // Move uploaded file
        if (!move_uploaded_file($file['tmp_name'], $file_path)) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file']);
            exit();
        }
        
        // Insert file record into database
        $stmt = $db->prepare("INSERT INTO `files` (name, original_name, title, file_path, file_type, file_size, division_id, lobby_id, section, category, uploaded_by, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $file_name,
            $file['name'],
            $title,
            $file_path,
            $file_ext,
            $file['size'],
            $division_id,
            $lobby_id,
            $section,
            $category,
            $user_id,
            $description
        ]);

        if ($result) {
            $newFileId = $db->lastInsertId();
            
            // Database notification records are now managed centrally by contentManagement.js
            // to prevent duplicates.
            /*
            try {
                $notifTitle = "New File Uploaded";
                // Use the provided title or original filename
                $displayTitle = !empty($title) ? $title : $file['name'];
                $notifMessage = "New file uploaded: " . $displayTitle;
                
                $notifStmt = $db->prepare("INSERT INTO notifications (title, message, type, created_by, target_division_id, target_lobby_id, is_active) VALUES (?, ?, 'info', ?, ?, ?, 1)");
                $notifStmt->execute([
                    $notifTitle,
                    $notifMessage,
                    $user_id,
                    $division_id,
                    $lobby_id
                ]);
            } catch (Exception $e) {
                // Log error but don't fail the upload
                error_log("Failed to create notification for file upload: " . $e->getMessage());
            }
            */
            
            // System updates and push notifications are now handled by contentManagement.js 
            // calling create_notification.php to prevent duplicates.
            /*
            try {
                $updateStmt = $db->prepare("INSERT INTO file_updates (file_id, action, target_division_id, target_lobby_id, target_section, created_by, created_at) VALUES (?, 'upload', ?, ?, ?, ?, NOW())");
                $updateStmt->execute([
                    $newFileId,
                    $division_id,
                    $lobby_id,
                    $section,
                    $user_id
                ]);
                
                // Trigger Web Push Notifications
                require_once '../notifications/push_notifier.php';
                $pushTitle = "New File: " . ($title ?: $file['name']);
                $pushMessage = "A new file has been uploaded to your section: " . ($section ?: "General");
                sendPushToTargetUsers($db, $pushTitle, $pushMessage, $division_id, $lobby_id, [
                    'file_id' => $newFileId,
                    'tab_id' => $section,
                    'type' => 'file_upload'
                ]);
                
            } catch (Exception $e) {
                error_log("Failed to track file update or send push: " . $e->getMessage());
            }
            */
            
            // Trigger system update for real-time sync
            updateSystemModule($db, 'files');

            echo json_encode([
                'success' => true,
                'message' => 'File uploaded successfully',
                'file_id' => $newFileId,
                'file_name' => $file_name,
                'division_id' => $division_id,
                'lobby_id' => $lobby_id,
                'section' => $section
            ]);
        } else {
            // Delete file if DB insertion failed
            unlink($file_path);
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save file record']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("Upload Error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage(),
        'debug' => [
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
} finally {
    if (ob_get_length()) ob_end_flush();
}
?>