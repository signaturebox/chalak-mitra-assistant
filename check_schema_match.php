<?php
require_once 'c:/Users/USER/Desktop/nwr chalak/api/config/db_config.php';
$db = getDBConnection();

$rows = $db->query("SELECT DISTINCT division FROM users")->fetchAll(PDO::FETCH_COLUMN);
echo "Unique division values in users table:\n";
foreach($rows as $val) {
    echo "- '$val'\n";
}

$rows = $db->query("SELECT id, name, code FROM divisions")->fetchAll(PDO::FETCH_ASSOC);
echo "\nDivisions table:\n";
foreach($rows as $row) {
    echo "- ID: {$row['id']}, Name: {$row['name']}, Code: {$row['code']}\n";
}
?>
