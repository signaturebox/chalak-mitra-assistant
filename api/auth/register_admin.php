<?php
/**
 * Admin User Registration API
 * Creates Division Admin or Lobby Admin users in the database
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
    $required_fields = ['email', 'password', 'role', 'division'];
    foreach ($required_fields as $field) {
        if (empty($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "$field is required"]);
            exit();
        }
    }
    
    $email = $input['email'];
    $password = $input['password'];
    $role = $input['role']; // 'division' or 'lobby'
    $division = strtolower($input['division']);
    $lobby = $input['lobby'] ?? null;
    $name = $input['name'] ?? $email; // Use email as name if not provided
    $mobile = $input['mobile'] ?? null;
    $created_by = $input['created_by'] ?? null;
    
    // Validate role
    if (!in_array($role, ['division', 'lobby'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid role. Must be "division" or "lobby"']);
        exit();
    }
    
    // Lobby admin requires lobby field
    if ($role === 'lobby' && empty($lobby)) {
        http_response_code(400);
        echo json_encode(['error' => 'Lobby is required for lobby admin']);
        exit();
    }
    
    // Validate division
    $valid_divisions = ['jaipur', 'ajmer', 'jodhpur', 'bikaner'];
    if (!in_array($division, $valid_divisions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid division']);
        exit();
    }
    
    // Validate password strength (min 4 chars)
    if (strlen($password) < 4) {
        http_response_code(400);
        echo json_encode(['error' => 'Password must be at least 4 characters']);
        exit();
    }
    
    // Check if email already exists
    $stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Email already exists. This admin account is already registered.']);
        exit();
    }
    
    // Generate a unique CMS ID for admin
    $rolePrefix = $role === 'division' ? 'DIV' : 'LOB';
    $divPrefix = strtoupper(substr($division, 0, 3));
    $timestamp = time();
    $cms_id = "{$rolePrefix}_{$divPrefix}_{$timestamp}";
    
    // Hash the password
    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    
    // Get the admin's name from the email (first part before @)
    if (!$name || $name === $email) {
        $name = ucfirst(explode('@', $email)[0]) . ' Admin';
    }
    
    // Designation based on role
    $designation = $role === 'division' ? 'DRM' : 'LM';
    
    // Insert new admin user
    $stmt = $db->prepare("INSERT INTO users (cms_id, name, email, mobile, password_hash, role, division, lobby, designation, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)");
    $result = $stmt->execute([$cms_id, $name, $email, $mobile, $password_hash, $role, $division, $lobby, $designation]);
    
    if ($result) {
        // Get the inserted user data
        $stmt = $db->prepare("SELECT id, cms_id, name, email, mobile, role, division, lobby, designation FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'message' => ucfirst($role) . ' Admin created successfully',
            'user' => $user
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create admin user']);
    }
    
} catch (PDOException $e) {
    http_response_code(500);
    
    // Check for duplicate entry error
    if ($e->getCode() == 23000) {
        echo json_encode(['error' => 'An admin with this email already exists']);
    } else {
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>
