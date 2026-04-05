<?php
require_once 'c:/Users/USER/Desktop/nwr chalak/api/config/db_config.php';
$db = getDBConnection();
echo "--- DIVISIONS ---\n";
$stmt = $db->query("SELECT * FROM divisions");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
echo "--- LOBBIES ---\n";
$stmt = $db->query("SELECT * FROM lobbies LIMIT 20");
while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
    print_r($row);
}
?>
