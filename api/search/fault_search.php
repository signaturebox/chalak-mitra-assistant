<?php
/**
 * Fault Search API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $query = $_GET['q'] ?? '';
        $type = $_GET['type'] ?? 'all'; // electric, diesel, vb, or all
        
        // Build the query
        $sql = "SELECT id, type, code, title, loco, symptom, fix, created_at FROM fault_database WHERE is_active = 1";
        $params = [];
        
        if (!empty($query)) {
            $sql .= " AND (code LIKE ? OR title LIKE ? OR symptom LIKE ? OR loco LIKE ?)";
            $searchTerm = "%$query%";
            $params = [$searchTerm, $searchTerm, $searchTerm, $searchTerm];
        }
        
        if ($type !== 'all') {
            if (!empty($query)) {
                $sql .= " AND type = ?";
            } else {
                $sql .= " AND type = ?";
            }
            $params[] = $type;
        }
        
        $sql .= " ORDER BY code ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'results' => $results,
            'count' => count($results)
        ]);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Add new fault (admin only)
        $input = json_decode(file_get_contents('php://input'), true);
        
        // In a real application, you would verify admin access here
        // For demo purposes, we'll allow it
        
        $required_fields = ['type', 'code', 'title', 'loco', 'symptom', 'fix'];
        foreach ($required_fields as $field) {
            if (empty($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "$field is required"]);
                exit();
            }
        }
        
        $stmt = $db->prepare("INSERT INTO fault_database (type, code, title, loco, symptom, fix) VALUES (?, ?, ?, ?, ?, ?)");
        $result = $stmt->execute([
            $input['type'],
            $input['code'],
            $input['title'],
            $input['loco'],
            $input['symptom'],
            $input['fix']
        ]);
        
        if ($result) {
            $new_id = $db->lastInsertId();
            echo json_encode([
                'success' => true,
                'message' => 'Fault added successfully',
                'id' => $new_id
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add fault']);
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>