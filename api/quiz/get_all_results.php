<?php
/**
 * Get All Quiz Results API
 * For admin panel to view all quiz attempts across users
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        $role = $_GET['role'] ?? null;
        $division = $_GET['division'] ?? null;
        $lobby = $_GET['lobby'] ?? null;
        
        // Build query based on user role permissions
        // Join with users table to get crew details (cms_id, name, division, lobby)
        $sql = "SELECT qa.id, u.cms_id, u.name as crew_name, u.division, u.lobby, 
                       qa.quiz_topic, qa.total_questions, qa.correct_answers, qa.score, 
                       qa.is_passed, qa.attempted_at, qa.certificate_id
                FROM quiz_attempts qa
                JOIN users u ON qa.user_id = u.id
                WHERE 1=1";
        $params = [];
        
        // Role-based filtering
        if (($role === 'division' || $role === 'divisionadmin') && $division) {
            $sql .= " AND u.division = ?";
            $params[] = $division;
        } elseif (($role === 'lobby' || $role === 'lobbyadmin') && $lobby) {
            $sql .= " AND u.lobby = ?";
            $params[] = $lobby;
        }
        
        $sql .= " ORDER BY qa.attempted_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format results to match the expected format for frontend
        $formatted_results = [];
        foreach ($results as $row) {
            $formatted_results[] = [
                'id' => 'server_' . $row['id'], // Add prefix to distinguish from localStorage IDs
                'cmsId' => $row['cms_id'],
                'crewName' => $row['crew_name'],
                'divisionId' => $row['division'],
                'divisionName' => strtoupper($row['division']),
                'lobbyId' => $row['lobby'],
                'lobbyName' => $row['lobby'],
                'score' => (int)$row['correct_answers'],
                'total' => (int)$row['total_questions'],
                'percentage' => round(((int)$row['correct_answers'] / (int)$row['total_questions']) * 100, 1),
                'category' => $row['quiz_topic'],
                'timestamp' => $row['attempted_at'],
                'date' => date('d/m/Y', strtotime($row['attempted_at']))
            ];
        }
        
        echo json_encode([
            'success' => true,
            'results' => $formatted_results,
            'count' => count($formatted_results)
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}
?>