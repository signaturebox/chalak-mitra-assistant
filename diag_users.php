<?php
require_once 'c:/Users/USER/Desktop/nwr chalak/api/config/db_config.php';
$db = getDBConnection();
$users = $db->query("SELECT cms_id, division, lobby FROM users LIMIT 10")->fetchAll();
header('Content-Type: text/plain');
print_r($users);
?>
