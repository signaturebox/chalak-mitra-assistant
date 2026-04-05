<?php
/**
 * User Registration API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit();
    }
    
    // Validate required fields
    $required_fields = ['cms_id', 'name', 'mobile', 'designation', 'division', 'lobby', 'password'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "$field is required"]);
            exit();
        }
    }
    
    $cms_id = $input['cms_id'];
    $name = $input['name'];
    $email = $input['email'] ?? null;
    $mobile = $input['mobile'];
    $designation = $input['designation'];
    $division = $input['division'];
    $lobby = $input['lobby'];
    $password = $input['password'];
    $confirm_password = $input['confirm_password'] ?? '';
    
    // Validate password match
    if ($password !== $confirm_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Passwords do not match']);
        exit();
    }
    
    // Validate password strength (min 6 chars)
    if (strlen($password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 6 characters']);
        exit();
    }
    
    // Check if CMS ID already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE cms_id = ?");
    $stmt->execute([$cms_id]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'CMS ID already exists']);
        exit();
    }
    
    // Check if email already exists (if provided)
    if ($email) {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$email]);
        if ($stmt->fetch()) {
            http_response_code(400);
            echo json_encode(['error' => 'Email already exists']);
            exit();
        }
    }
    
    // Check if mobile already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE mobile = ?");
    $stmt->execute([$mobile]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Mobile number already exists']);
        exit();
    }
    
    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Insert new user
    $stmt = $db->prepare("INSERT INTO users (cms_id, name, email, mobile, password_hash, role, division, lobby, designation) VALUES (?, ?, ?, ?, ?, 'crew', ?, ?, ?)");
    $result = $stmt->execute([$cms_id, $name, $email, $mobile, $password_hash, $division, $lobby, $designation]);
    
    if ($result) {
        // Get the inserted user data
        $stmt = $db->prepare("SELECT id, cms_id, name, email, mobile, role, division, lobby, designation FROM users WHERE cms_id = ?");
        $stmt->execute([$cms_id]);
        $user = $stmt->fetch();
        
        echo json_encode([
            'success' => true,
            'message' => 'Registration successful',
            'user' => $user
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Registration failed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>