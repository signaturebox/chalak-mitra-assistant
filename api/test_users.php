<?php
require_once 'config/db_config.php';

try {
    $db = getDBConnection();
    
    echo "✅ Database connection successful\n\n";
    
    // Get all users from the database
    $stmt = $db->prepare("SELECT id, cms_id, name, email, role, division, lobby, designation, created_at FROM users ORDER BY created_at DESC LIMIT 10");
    $stmt->execute();
    $users = $stmt->fetchAll();
    
    echo "📋 All users in database (most recent first):\n";
    foreach ($users as $user) {
        echo "ID: " . $user['id'] . " | CMS: " . $user['cms_id'] . " | Name: " . $user['name'] . " | Email: " . $user['email'] . " | Role: " . $user['role'] . " | Division: " . $user['division'] . " | Lobby: " . $user['lobby'] . " | Created: " . $user['created_at'] . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>