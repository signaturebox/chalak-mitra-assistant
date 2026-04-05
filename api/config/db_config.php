<?php
/**
 * Database Configuration for NWR Chalak Mitra
 */

// Database configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'u191706077_nwrchalak');
define('DB_USER', 'u191706077_nwrchalak');  // Default MySQL user
define('DB_PASS', 'Ritu@4200');      // Default MySQL password is empty
define('DB_CHARSET', 'utf8mb4');

// Create PDO connection
function getDBConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (\PDOException $e) {
        throw new \PDOException($e->getMessage(), (int)$e->getCode());
    }
}

// Helper to update system module timestamp for real-time sync
function updateSystemModule($db, $module) {
    try {
        // Try to update with sync_counter
        $stmt = $db->prepare("INSERT INTO system_updates (module, updated_at, sync_counter) VALUES (?, CURRENT_TIMESTAMP, 1) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP, sync_counter = COALESCE(sync_counter, 0) + 1");
        $stmt->execute([$module]);
    } catch (Exception $e) {
        // Table might not exist or needs migration, create/alter it
        try {
            // Check if table exists
            $db->query("SELECT 1 FROM system_updates LIMIT 1");
            
            // If exists, try to add column if missing
            try {
                $db->exec("ALTER TABLE system_updates ADD COLUMN sync_counter INT DEFAULT 0");
            } catch (Exception $ex) {
                // Column likely exists
            }
        } catch (Exception $ex) {
            // Table doesn't exist
            $db->exec("CREATE TABLE IF NOT EXISTS system_updates (
                module VARCHAR(50) PRIMARY KEY,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                sync_counter INT DEFAULT 0
            )");
        }
        
        // Retry update with COALESCE to handle existing NULLs
        $stmt = $db->prepare("INSERT INTO system_updates (module, updated_at, sync_counter) VALUES (?, CURRENT_TIMESTAMP, 1) ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP, sync_counter = COALESCE(sync_counter, 0) + 1");
        $stmt->execute([$module]);
    }
}

// Enable CORS for API access
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Only set JSON content type if not an SSE endpoint
// SSE endpoints set their own content-type header
$requestUri = $_SERVER['REQUEST_URI'] ?? '';
$isSSE = strpos($requestUri, 'realtime') !== false || 
         strpos($requestUri, 'updates.php') !== false;
if (!$isSSE && !headers_sent()) {
    header('Content-Type: application/json; charset=utf-8');
}

// Handle preflight requests
if (isset($_SERVER['REQUEST_METHOD']) && $_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>