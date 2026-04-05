<?php
/**
 * Get Users API
 * Retrieves all users or filtered by role/division for admin panel
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit();
    }
    
    // Get query parameters
    $role = $_GET['role'] ?? null;
    $division = $_GET['division'] ?? null;
    $created_by = $_GET['created_by'] ?? null;
    
    // Build query based on filters
    $sql = "SELECT id, cms_id, name, email, mobile, role, division, lobby, designation, is_active, created_at FROM users WHERE 1=1";
    $params = [];
    
    if ($role) {
        $sql .= " AND role = ?";
        $params[] = $role;
    }
    
    if ($division) {
        $sql .= " AND division = ?";
        $params[] = $division;
    }
    
    if ($created_by) {
        $sql .= " AND created_by = ?";
        $params[] = $created_by;
    }
    
    $sql .= " ORDER BY created_at DESC";
    
    $stmt = $db->prepare($sql);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'users' => $users,
        'count' => count($users)
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>