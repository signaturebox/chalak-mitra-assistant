<?php
/**
 * Get Quiz History API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['error' => 'User ID is required']);
            exit();
        }
        
        $sql = "SELECT qa.id, qa.quiz_topic, qa.total_questions, qa.correct_answers, qa.score, qa.is_passed, qa.attempted_at, qa.certificate_id, c.certificate_id as certificate_exists
                FROM quiz_attempts qa
                LEFT JOIN certificates c ON qa.id = c.quiz_attempt_id
                WHERE qa.user_id = ?
                ORDER BY qa.attempted_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([$user_id]);
        $history = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'history' => $history,
            'count' => count($history)
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