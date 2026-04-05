<?php
/**
 * Get All Quiz Attempts API (for Admin Panel)
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Fetch all quiz attempts with user information
        $sql = "SELECT qa.*, u.cms_id, u.name as user_name, u.mobile, u.division, u.lobby
                FROM quiz_attempts qa
                LEFT JOIN users u ON qa.user_id = u.id
                ORDER BY qa.attempted_at DESC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute();
        $attempts = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Process the data to match frontend expectations
        $processedAttempts = [];
        foreach ($attempts as $attempt) {
            $processedAttempts[] = [
                'id' => $attempt['id'],
                'user_id' => $attempt['user_id'],
                'user_name' => $attempt['user_name'] ?? 'Unknown User',
                'cms_id' => $attempt['cms_id'] ?? $attempt['user_id'], // Using actual cms_id from database, fallback to user_id
                'mobile' => $attempt['mobile'] ?? '',
                'division' => $attempt['division'] ?? '',
                'lobby' => $attempt['lobby'] ?? '',
                'quiz_topic' => $attempt['quiz_topic'] ?? 'mixed',
                'total_questions' => $attempt['total_questions'] ?? 0,
                'correct_answers' => $attempt['correct_answers'] ?? 0,
                'score' => $attempt['score'] ?? 0,
                'is_passed' => $attempt['is_passed'] ?? 0,
                'attempted_at' => $attempt['attempted_at'],
                'certificate_id' => $attempt['certificate_id'] ?? null,
                'created_at' => $attempt['attempted_at']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'results' => $processedAttempts,
            'count' => count($processedAttempts)
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