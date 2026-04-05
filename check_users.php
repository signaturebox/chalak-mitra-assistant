<?php
require_once 'c:/Users/USER/Desktop/nwr chalak/api/config/db_config.php';
$db = getDBConnection();
echo "--- USERS DIVISION/LOBBY ---\n";
$stmt = $db->query("SELECT division, lobby FROM users LIMIT 10");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
?>
