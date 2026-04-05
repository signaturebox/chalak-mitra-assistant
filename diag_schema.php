<?php
require_once 'api/config/db_config.php';
$db = getDBConnection();

echo "DIVISIONS:\n";
$divisions = $db->query("SELECT id, name, code FROM divisions")->fetchAll(PDO::FETCH_ASSOC);
print_r($divisions);

echo "\nLOBBIES (First 10):\n";
$lobbies = $db->query("SELECT id, name, code, division_id FROM lobbies LIMIT 10")->fetchAll(PDO::FETCH_ASSOC);
print_r($lobbies);
?>
