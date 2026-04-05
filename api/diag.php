<?php
header('Content-Type: application/json');

$results = [
    'php_version' => PHP_VERSION,
    'mysql_extension' => extension_loaded('pdo_mysql'),
    'db_connection' => false,
    'db_config_file' => [
        'exists' => file_exists(__DIR__ . '/config/db_config.php'),
        'path' => realpath(__DIR__ . '/config/db_config.php')
    ],
    'uploads_dir' => [
        'exists' => false,
        'writable' => false,
        'path' => realpath(__DIR__ . '/../uploads')
    ],
    'api_file_api_dir' => [
        'exists' => is_dir(__DIR__ . '/file_api'),
        'writable' => is_writable(__DIR__ . '/file_api')
    ],
    'db_error' => null
];

// Check DB
if ($results['db_config_file']['exists']) {
    try {
        require_once 'config/db_config.php';
        $db = getDBConnection();
        $results['db_connection'] = true;
        
        // Check tables
        $stmt = $db->query("SHOW TABLES LIKE 'files'");
        $results['files_table_exists'] = $stmt->rowCount() > 0;
        
        if ($results['files_table_exists']) {
            $stmt = $db->query("DESCRIBE `files` balance"); // Just checking if it can query
            $results['files_table_queriable'] = true;
        }
    } catch (Exception $e) {
        $results['db_error'] = $e->getMessage();
    }
}

// Check Uploads
$upload_dir = __DIR__ . '/../uploads';
if (file_exists($upload_dir)) {
    $results['uploads_dir']['exists'] = true;
    $results['uploads_dir']['writable'] = is_writable($upload_dir);
}

echo json_encode($results, JSON_PRETTY_PRINT);
