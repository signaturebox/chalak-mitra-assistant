<?php
require_once 'api/config/db_config.php';
try {
    $db = getDBConnection();
    
    echo "DIVISIONS:\n";
    $divs = $db->query("SELECT * FROM divisions")->fetchAll();
    print_r($divs);
    
    echo "\nLOBBIES:\n";
    $lobbies = $db->query("SELECT * FROM lobbies")->fetchAll();
    print_r($lobbies);
    
    echo "\nUSERS SAMPLE:\n";
    $users = $db->query("SELECT id, cms_id, division, lobby FROM users LIMIT 10")->fetchAll();
    print_r($users);
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
