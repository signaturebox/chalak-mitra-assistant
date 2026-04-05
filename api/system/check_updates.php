<?php
/**
 * System Update Checker API
 * Returns timestamps for various system modules to enable real-time sync
 */

require_once '../config/db_config.php';

try {
    // Prevent caching
    header("Cache-Control: no-cache, no-store, must-revalidate");
    header("Pragma: no-cache");
    header("Expires: 0");

    $db = getDBConnection();

    // Ensure table exists (idempotent)
    $db->exec("CREATE TABLE IF NOT EXISTS system_updates (
        module VARCHAR(50) PRIMARY KEY,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        sync_counter INT DEFAULT 0
    )");

    // Get combined token (timestamp + counter)
    // Use COALESCE to handle potential NULLs during migration
    $stmt = $db->query("SELECT module, CONCAT(COALESCE(updated_at, ''), '|', COALESCE(sync_counter, '0')) as token FROM system_updates");
    $updates = $stmt->fetchAll(PDO::FETCH_KEY_PAIR); // returns ['module' => 'token']

    echo json_encode(['success' => true, 'updates' => $updates]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>