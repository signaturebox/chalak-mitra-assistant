<?php
// Test login directly
header('Content-Type: application/json');

// Simulate the POST data that would be sent from the frontend
$_POST = array();
$_SERVER['REQUEST_METHOD'] = 'POST';
$_SERVER['HTTP_CONTENT_TYPE'] = 'application/json';

// For testing, let's manually set the input
$input = array(
    'identifier' => 'ritutechno.jpr@gmail.com',
    'password' => 'password'
);

// Now include the login script with our simulated input
// We'll capture the output to see what's happening
ob_start();

// Mock the JSON input
$originalInput = file_get_contents('php://input');
// We'll use a different approach to test the login logic

require_once 'config/db_config.php';

try {
    $db = getDBConnection();
    
    $identifier = $input['identifier'];
    $password = $input['password'];
    
    // Find user by CMS ID or email
    $stmt = $db->prepare("SELECT id, cms_id, name, email, mobile, password_hash, role, division, lobby, designation, profile_image FROM users WHERE (cms_id = ? OR email = ?) AND is_active = 1");
    $stmt->execute([$identifier, $identifier]);
    $user = $stmt->fetch();
    
    if (!$user) {
        echo json_encode(['error' => 'User not found']);
    } else {
        echo json_encode([
            'message' => 'User found in database',
            'user_data' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email'],
                'role' => $user['role'],
                'password_hash' => $user['password_hash']
            ],
            'password_match' => password_verify($password, $user['password_hash'])
        ]);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>