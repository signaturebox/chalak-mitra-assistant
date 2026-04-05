<?php
/**
 * Real-time Updates API v2
 * 
 * Server-Sent Events endpoint for instant file synchronization
 * across all connected clients.
 */

// Set headers for SSE FIRST - before any other output
header('Content-Type: text/event-stream');
header('Cache-Control: no-cache');
header('Connection: keep-alive');
header('X-Accel-Buffering: no'); // Disable nginx buffering

require_once __DIR__ . '/../config/db_config.php';

// Disable output buffering
@ini_set('output_buffering', 'off');
@ini_set('zlib.output_compression', false);
@ini_set('implicit_flush', true);

// Get connection parameters
$user_id = $_GET['user_id'] ?? '';
$division = $_GET['division'] ?? '';
$lobby = $_GET['lobby'] ?? '';
$last_event_id = intval($_GET['last_event_id'] ?? 0);

if (empty($user_id)) {
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'User ID required']) . "\n\n";
    ob_flush();
    flush();
    exit;
}

// Database connection
try {
    $pdo = getDBConnection();
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "event: error\n";
    echo "data: " . json_encode(['error' => 'Database connection failed']) . "\n\n";
    ob_flush();
    flush();
    exit;
}

// Convert division name to ID if needed
$division_id = null;
if (!empty($division)) {
    // Check if division is a name (like 'bikaner') or an ID
    if (!is_numeric($division)) {
        // It's a name, look up the ID
        $divStmt = $pdo->prepare("SELECT id FROM divisions WHERE LOWER(name) = LOWER(?) OR LOWER(code) = LOWER(?) LIMIT 1");
        $divStmt->execute([$division, $division]);
        $division_id = $divStmt->fetchColumn();
    } else {
        $division_id = $division;
    }
}

// Convert lobby name to ID if needed
$lobby_id = null;
if (!empty($lobby)) {
    // Check if lobby is a name or an ID
    if (!is_numeric($lobby)) {
        // It's a name, look up the ID
        $lobbyStmt = $pdo->prepare("SELECT id FROM lobbies WHERE LOWER(name) = LOWER(?) LIMIT 1");
        $lobbyStmt->execute([$lobby]);
        $lobby_id = $lobbyStmt->fetchColumn();
    } else {
        $lobby_id = $lobby;
    }
}

// Send initial connection event
echo "event: connected\n";
echo "data: " . json_encode([
    'message' => 'Connected to real-time updates',
    'user_id' => $user_id,
    'timestamp' => date('Y-m-d H:i:s')
]) . "\n\n";
ob_flush();
flush();

$heartbeat_count = 0;
$last_check_time = date('Y-m-d H:i:s');

// Main event loop
while (true) {
    // Check for new file uploads
    $uploads = checkNewUploads($pdo, $last_check_time, $division_id, $lobby_id);
    foreach ($uploads as $upload) {
        $last_event_id++;
        echo "event: file_upload\n";
        echo "id: " . $last_event_id . "\n";
        echo "data: " . json_encode([
            'event_id' => $last_event_id,
            'type' => 'file_upload',
            'file' => $upload,
            'target_id' => $upload['section'] ?? $upload['target_id'] ?? 'root',
            'target_type' => $upload['target_type'] ?? 'tab',
            'timestamp' => date('Y-m-d H:i:s')
        ]) . "\n\n";
        ob_flush();
        flush();
    }
    
    // Check for file deletions
    $deletions = checkDeletions($pdo, $last_check_time, $division_id, $lobby_id);
    foreach ($deletions as $deletion) {
        $last_event_id++;
        echo "event: file_delete\n";
        echo "id: " . $last_event_id . "\n";
        echo "data: " . json_encode([
            'event_id' => $last_event_id,
            'type' => 'file_delete',
            'file_id' => $deletion['file_id'],
            'target_id' => $deletion['section'] ?? 'root',
            'timestamp' => date('Y-m-d H:i:s')
        ]) . "\n\n";
        ob_flush();
        flush();
    }
    
    // Check for file edits
    $edits = checkEdits($pdo, $last_check_time, $division_id, $lobby_id);
    foreach ($edits as $edit) {
        $last_event_id++;
        echo "event: file_edit\n";
        echo "id: " . $last_event_id . "\n";
        echo "data: " . json_encode([
            'event_id' => $last_event_id,
            'type' => 'file_edit',
            'file' => $edit,
            'target_id' => $edit['section'] ?? 'root',
            'timestamp' => date('Y-m-d H:i:s')
        ]) . "\n\n";
        ob_flush();
        flush();
    }
    
    // Send heartbeat every 15 seconds
    $heartbeat_count++;
    if ($heartbeat_count >= 3) {
        $last_event_id++;
        echo "event: heartbeat\n";
        echo "id: " . $last_event_id . "\n";
        echo "data: " . json_encode([
            'event_id' => $last_event_id,
            'timestamp' => date('Y-m-d H:i:s')
        ]) . "\n\n";
        ob_flush();
        flush();
        $heartbeat_count = 0;
    }
    
    $last_check_time = date('Y-m-d H:i:s');
    
    // Sleep for 5 seconds before next check
    sleep(5);
    
    // Check if client disconnected
    if (connection_aborted()) {
        break;
    }
}

/**
 * Check for new file uploads
 */
function checkNewUploads($pdo, $since, $division, $lobby) {
    $uploads = [];
    
    try {
        $sql = "
            SELECT f.*, d.name as division_name, l.name as lobby_name, u.name as uploaded_by_name
            FROM files f
            LEFT JOIN divisions d ON f.division_id = d.id
            LEFT JOIN lobbies l ON f.lobby_id = l.id
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.created_at > :since
            AND f.is_deleted = 0
        ";
        
        $params = [':since' => $since];
        
        // Division filtering - show files for user's division OR global files
        if (!empty($division)) {
            $sql .= " AND (f.division_id = :division OR f.division_id IS NULL OR f.division_id = '')";
            $params[':division'] = $division;
        }
        
        // Lobby filtering - show files for user's lobby OR division-level files
        if (!empty($lobby)) {
            $sql .= " AND (f.lobby_id = :lobby OR f.lobby_id IS NULL OR f.lobby_id = '')";
            $params[':lobby'] = $lobby;
        }
        
        $sql .= " ORDER BY f.created_at ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($files as $file) {
            $uploads[] = formatFileData($file);
        }
        
    } catch (PDOException $e) {
        error_log("[RealtimeV2] Error checking uploads: " . $e->getMessage());
    }
    
    return $uploads;
}

/**
 * Check for file deletions
 */
function checkDeletions($pdo, $since, $division, $lobby) {
    $deletions = [];
    
    try {
        $sql = "
            SELECT fd.*, f.section, f.division_id, f.lobby_id
            FROM file_deletions fd
            JOIN files f ON fd.file_id = f.id
            WHERE fd.deleted_at > :since
        ";
        
        $params = [':since' => $since];
        
        // Division filtering - show files for user's division OR global files
        if (!empty($division)) {
            $sql .= " AND (f.division_id = :division OR f.division_id IS NULL OR f.division_id = '')";
            $params[':division'] = $division;
        }
        
        // Lobby filtering - show files for user's lobby OR division-level files
        if (!empty($lobby)) {
            $sql .= " AND (f.lobby_id = :lobby OR f.lobby_id IS NULL OR f.lobby_id = '')";
            $params[':lobby'] = $lobby;
        }
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $deletions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
    } catch (PDOException $e) {
        error_log("[RealtimeV2] Error checking deletions: " . $e->getMessage());
    }
    
    return $deletions;
}

/**
 * Check for file edits
 */
function checkEdits($pdo, $since, $division, $lobby) {
    $edits = [];
    
    try {
        $sql = "
            SELECT f.*, d.name as division_name, l.name as lobby_name, u.name as uploaded_by_name
            FROM files f
            LEFT JOIN divisions d ON f.division_id = d.id
            LEFT JOIN lobbies l ON f.lobby_id = l.id
            LEFT JOIN users u ON f.uploaded_by = u.id
            WHERE f.updated_at > :since
            AND f.updated_at != f.created_at
            AND f.is_deleted = 0
        ";
        
        $params = [':since' => $since];
        
        if (!empty($division)) {
            $sql .= " AND (f.division_id = :division OR f.division_id IS NULL)";
            $params[':division'] = $division;
        }
        
        if (!empty($lobby)) {
            $sql .= " AND (f.lobby_id = :lobby OR f.lobby_id IS NULL)";
            $params[':lobby'] = $lobby;
        }
        
        $sql .= " ORDER BY f.updated_at ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $files = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($files as $file) {
            $edits[] = formatFileData($file);
        }
        
    } catch (PDOException $e) {
        error_log("[RealtimeV2] Error checking edits: " . $e->getMessage());
    }
    
    return $edits;
}

/**
 * Format file data for response
 */
function formatFileData($file) {
    // Parse content for html/message types
    $content = null;
    if (($file['file_type'] === 'html' || $file['file_type'] === 'message') && $file['original_name']) {
        $decoded = json_decode($file['original_name'], true);
        if (json_last_error() === JSON_ERROR_NONE) {
            $content = $decoded;
        } else {
            $content = $file['original_name'];
        }
    }
    
    // Build URL for regular files
    $url = null;
    if ($file['file_type'] === 'url') {
        $url = $file['original_name'] || $file['file_path'];
    } elseif (in_array($file['file_type'], ['pdf', 'image', 'excel'])) {
        $url = './uploads/' . $file['name'];
    }
    
    return [
        'id' => $file['id'],
        'name' => $file['name'],
        'title' => $file['title'] ?: $file['original_name'],
        'original_name' => $file['original_name'],
        'file_type' => $file['file_type'],
        'type' => $file['file_type'],
        'description' => $file['description'] ?: '',
        'content' => $content,
        'url' => $url,
        'uploaded_by' => $file['uploaded_by'],
        'uploaded_by_name' => $file['uploaded_by_name'] ?: 'System',
        'uploaded_at' => $file['created_at'],
        'created_at' => $file['created_at'],
        'division_id' => $file['division_id'],
        'division_name' => $file['division_name'],
        'lobby_id' => $file['lobby_id'],
        'lobby_name' => $file['lobby_name'],
        'section' => $file['section'],
        'category' => $file['category'],
        'target_id' => $file['section'] ?? 'root',
        'target_type' => 'tab'
    ];
}
