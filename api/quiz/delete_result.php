<?php
/**
 * Delete Quiz Result API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID is required']);
            exit();
        }
        
        $id_param = $input['id'];
        
        // Check if it's a server ID (prefixed with 'server_')
        if (strpos($id_param, 'server_') === 0) {
            $id = substr($id_param, 7); // Remove 'server_' prefix
        } else {
            // If it's not a server ID, we can't delete it from the server
            // But we'll return success so the frontend can remove it from local storage
            echo json_encode(['success' => true, 'message' => 'Local result ignored by server']);
            exit();
        }
        
        if (!is_numeric($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Invalid ID format']);
            exit();
        }
        
        // Delete the quiz attempt
        // Note: related certificates will be deleted automatically due to ON DELETE CASCADE if set,
        // otherwise we might need to delete them manually. 
        // Based on schema: CONSTRAINT `fk_certificate_quiz` ... ON DELETE CASCADE
        $stmt = $db->prepare("DELETE FROM quiz_attempts WHERE id = ?");
        $result = $stmt->execute([$id]);
        
        if ($result) {
            if ($stmt->rowCount() > 0) {
                // Trigger system update for real-time sync
                updateSystemModule($db, 'quiz_results');
                
                echo json_encode(['success' => true, 'message' => 'Quiz result deleted successfully']);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Quiz result not found']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete quiz result']);
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