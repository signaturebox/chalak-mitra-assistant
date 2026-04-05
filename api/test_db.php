<?php
require_once 'config/db_config.php';

try {
    $db = getDBConnection();
    
    // Test if database connection works
    echo "✅ Database connection successful\n";
    
    // Check if the user exists in the database
    $stmt = $db->prepare("SELECT id, cms_id, name, email, password_hash, role FROM users WHERE email = ? AND is_active = 1");
    $stmt->execute(['ritutechno.jpr@gmail.com']);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "✅ User found in database:\n";
        echo "ID: " . $user['id'] . "\n";
        echo "CMS ID: " . $user['cms_id'] . "\n";
        echo "Name: " . $user['name'] . "\n";
        echo "Email: " . $user['email'] . "\n";
        echo "Password hash: " . $user['password_hash'] . "\n";
        echo "Role: " . $user['role'] . "\n";
        
        // Test password verification
        $testPassword = 'password';
        if (password_verify($testPassword, $user['password_hash'])) {
            echo "✅ Password 'password' matches the hash\n";
        } else {
            echo "❌ Password 'password' does NOT match the hash\n";
        }
        
        $testPassword2 = 'Ritu@5011';
        if (password_verify($testPassword2, $user['password_hash'])) {
            echo "✅ Password 'Ritu@5011' matches the hash\n";
        } else {
            echo "❌ Password 'Ritu@5011' does NOT match the hash\n";
        }
    } else {
        echo "❌ User NOT found in database with email: ritutechno.jpr@gmail.com\n";
        
        // Check if the user exists with a different email format
        $stmt = $db->prepare("SELECT id, cms_id, name, email, role FROM users WHERE cms_id = ? AND is_active = 1");
        $stmt->execute(['ritutechno.jpr@gmail.com']);
        $user = $stmt->fetch();
        
        if ($user) {
            echo "✅ User found in database (matched by CMS ID):\n";
            echo "ID: " . $user['id'] . "\n";
            echo "CMS ID: " . $user['cms_id'] . "\n";
            echo "Name: " . $user['name'] . "\n";
            echo "Email: " . $user['email'] . "\n";
            echo "Role: " . $user['role'] . "\n";
        } else {
            echo "❌ User NOT found in database at all\n";
            
            // Show all users for debugging
            $stmt = $db->prepare("SELECT id, cms_id, name, email, role FROM users");
            $stmt->execute();
            $users = $stmt->fetchAll();
            
            echo "\n📋 All users in database:\n";
            foreach ($users as $user) {
                echo "ID: " . $user['id'] . " | CMS: " . $user['cms_id'] . " | Email: " . $user['email'] . " | Role: " . $user['role'] . "\n";
            }
        }
    }
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>