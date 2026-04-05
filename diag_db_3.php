<?php
// Test 127.0.0.1
try {
    $dsn = "mysql:host=127.0.0.1;dbname=u191706077_nwrchalak;charset=utf8mb4";
    $db = new PDO($dsn, "u191706077_nwrchalak", "Ritu@4200");
    echo "CONNECTED TO 127.0.0.1\n";
    $users = $db->query("SELECT cms_id, division, lobby FROM users LIMIT 3")->fetchAll(PDO::FETCH_ASSOC);
    print_r($users);
} catch (Exception $e) {
    echo "127.0.0.1 FAILED: " . $e->getMessage() . "\n";
}

// Test localhost
try {
    $dsn = "mysql:host=localhost;dbname=u191706077_nwrchalak;charset=utf8mb4";
    $db = new PDO($dsn, "u191706077_nwrchalak", "Ritu@4200");
    echo "CONNECTED TO localhost\n";
} catch (Exception $e) {
    echo "localhost FAILED: " . $e->getMessage() . "\n";
}
?>
