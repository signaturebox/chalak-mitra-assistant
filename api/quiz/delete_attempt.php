<?php
/**
 * Delete Quiz Attempt API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $attempt_id = $input['attempt_id'] ?? null;
        
        if (!$attempt_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Attempt ID is required']);
            exit();
        }
        
        // Check if the quiz attempt exists
        $checkSql = "SELECT user_id FROM quiz_attempts WHERE id = ?";
        $checkStmt = $db->prepare($checkSql);
        $checkStmt->execute([$attempt_id]);
        $attempt = $checkStmt->fetch();
        
        if (!$attempt) {
            http_response_code(404);
            echo json_encode(['error' => 'Quiz attempt not found']);
            exit();
        }
        
        // Delete the quiz attempt
        $deleteSql = "DELETE FROM quiz_attempts WHERE id = ?";
        $deleteStmt = $db->prepare($deleteSql);
        $deleteResult = $deleteStmt->execute([$attempt_id]);
        
        if ($deleteResult) {
            // Also try to delete any related certificates
            $deleteCertSql = "DELETE FROM certificates WHERE quiz_attempt_id = ?";
            $deleteCertStmt = $db->prepare($deleteCertSql);
            $deleteCertStmt->execute([$attempt_id]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Quiz attempt deleted successfully'
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete quiz attempt']);
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