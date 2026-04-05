<?php
require_once 'api/config/db_config.php';
try {
    $db = getDBConnection();
    $stmt = $db->query("DESCRIBE users");
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    header('Content-Type: text/plain');
    print_r($result);
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
