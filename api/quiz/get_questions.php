<?php
/**
 * Get Quiz Questions API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $category = $_GET['category'] ?? 'mixed';
        $limit = (int)($_GET['limit'] ?? 10);
        
        // Validate category
        $valid_categories = ['mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block'];
        if (!in_array($category, $valid_categories)) {
            $category = 'mixed';
        }
        
        // Build query based on category
        if ($category === 'mixed') {
            $sql = "SELECT id, category, question, option_1, option_2, option_3, option_4, correct_answer FROM question_bank WHERE is_active = 1 ORDER BY RAND() LIMIT ?";
        } else {
            $sql = "SELECT id, category, question, option_1, option_2, option_3, option_4, correct_answer FROM question_bank WHERE category = ? AND is_active = 1 ORDER BY RAND() LIMIT ?";
        }
        
        $stmt = $db->prepare($sql);
        if ($category === 'mixed') {
            $stmt->execute([$limit]);
        } else {
            $stmt->execute([$category, $limit]);
        }
        
        $questions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Format questions to match frontend expectations
        $formatted_questions = [];
        foreach ($questions as $q) {
            $formatted_questions[] = [
                'id' => $q['id'],
                'category' => $q['category'],
                'question' => $q['question'],
                'options' => [
                    $q['option_1'],
                    $q['option_2'],
                    $q['option_3'],
                    $q['option_4']
                ],
                'correct_answer' => (int)$q['correct_answer']
            ];
        }
        
        echo json_encode([
            'success' => true,
            'questions' => $formatted_questions,
            'count' => count($formatted_questions)
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