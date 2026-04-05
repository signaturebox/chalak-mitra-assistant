<?php
/**
 * User Login API
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
    
    $identifier = $input['identifier'] ?? $input['cms_id'] ?? $input['email'] ?? '';
    $password = $input['password'] ?? '';
    $mobile = $input['mobile'] ?? '';
    $otp = $input['otp'] ?? '';
    
    // Validate input
    if (empty($identifier) && empty($mobile)) {
        http_response_code(400);
        echo json_encode(['error' => 'CMS ID/Email or Mobile is required']);
        exit();
    }
    
    // Log the login attempt
    $logStmt = $db->prepare("INSERT INTO login_attempts (user_identifier, ip_address, success, user_agent) VALUES (?, ?, ?, ?)");
    $logStmt->execute([$identifier, $_SERVER['REMOTE_ADDR'], 0, $_SERVER['HTTP_USER_AGENT'] ?? '']);
    
    // Check if using OTP method
    if (!empty($mobile) && !empty($otp)) {
        // Validate OTP (in a real app, this would be stored and validated properly)
        // For demo purposes, we'll accept any OTP
        $stmt = $db->prepare("
            SELECT u.*, d.id as division_id, l.id as lobby_id 
            FROM users u
            LEFT JOIN divisions d ON (u.division = d.code OR u.division = d.name)
            LEFT JOIN lobbies l ON (u.lobby = l.code OR u.lobby = l.name)
            WHERE u.mobile = ? AND u.is_active = 1
        ");
        $stmt->execute([$mobile]);
        $user = $stmt->fetch();
    } else {
        // Username/password method
        if (empty($password)) {
            http_response_code(400);
            echo json_encode(['error' => 'Password is required']);
            exit();
        }
        
        // Find user by CMS ID or email with division and lobby IDs
        $stmt = $db->prepare("
            SELECT u.*, d.id as division_id, l.id as lobby_id 
            FROM users u
            LEFT JOIN divisions d ON (u.division = d.code OR u.division = d.name)
            LEFT JOIN lobbies l ON (u.lobby = l.code OR u.lobby = l.name)
            WHERE (u.cms_id = ? OR u.email = ?) AND u.is_active = 1
        ");
        $stmt->execute([$identifier, $identifier]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            exit();
        }
        
        // Remove password hash from response
        unset($user['password_hash']);
    }
    
    // User is already fetched above, no need to fetch again
    
    if ($user) {
        // Update login attempt log
        $logUpdateStmt = $db->prepare("UPDATE login_attempts SET success = 1 WHERE user_identifier = ? AND ip_address = ? ORDER BY attempted_at DESC LIMIT 1");
        $logUpdateStmt->execute([$identifier, $_SERVER['REMOTE_ADDR']]);
        
        // Generate a simple session token (in production, use proper JWT)
        $token = bin2hex(random_bytes(32));
        
        // Store token in session (simplified approach)
        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['token'] = $token;
        
        // Return user data with token
        $response = [
            'success' => true,
            'token' => $token,
            'user' => $user
        ];
        
        echo json_encode($response);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid credentials']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>