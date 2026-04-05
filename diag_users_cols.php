<?php
require_once 'api/config/db_config.php';
try {
    $db = getDBConnection();
    echo "USERS TABLE:\n";
    $stmt = $db->query("DESCRIBE users");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
