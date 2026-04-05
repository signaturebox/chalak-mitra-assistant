<?php
/**
 * Manage Quiz Questions API
 * Add, edit, delete, and bulk upload quiz questions
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $action = $input['action'] ?? '';
        
        switch ($action) {
            case 'add':
                addQuestion($db, $input);
                break;
            case 'bulk_upload':
                bulkUploadQuestions($db, $input);
                break;
            case 'update':
                updateQuestion($db, $input);
                break;
            case 'delete':
                deleteQuestion($db, $input);
                break;
            default:
                http_response_code(400);
                echo json_encode(['error' => 'Invalid action']);
        }
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $action = $_GET['action'] ?? '';
        
        if ($action === 'stats') {
            getQuestionStats($db);
        } else {
            $category = $_GET['category'] ?? '';
            getQuestions($db, $category);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

function addQuestion($db, $input) {
    // Validate required fields
    $required_fields = ['category', 'question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_answer'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "$field is required"]);
            return;
        }
    }
    
    $category = $input['category'];
    $question = $input['question'];
    $option_1 = $input['option_1'];
    $option_2 = $input['option_2'];
    $option_3 = $input['option_3'];
    $option_4 = $input['option_4'];
    $correct_answer = (int)$input['correct_answer'];
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;
    
    // Validate category
    $valid_categories = ['mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block'];
    if (!in_array($category, $valid_categories)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category']);
        return;
    }
    
    // Validate correct answer (should be 0-3)
    if ($correct_answer < 0 || $correct_answer > 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Correct answer must be between 0 and 3']);
        return;
    }
    
    try {
        $sql = "INSERT INTO question_bank (category, question, option_1, option_2, option_3, option_4, correct_answer, is_active) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$category, $question, $option_1, $option_2, $option_3, $option_4, $correct_answer, $is_active]);
        
        if ($result) {
            echo json_encode([
                'success' => true,
                'message' => 'Question added successfully',
                'id' => $db->lastInsertId()
            ]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to add question']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function bulkUploadQuestions($db, $input) {
    $questions = $input['questions'] ?? [];
    
    if (empty($questions) || !is_array($questions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Questions array is required']);
        return;
    }
    
    $added_count = 0;
    $failed_count = 0;
    $errors = [];
    
    $sql = "INSERT INTO question_bank (category, question, option_1, option_2, option_3, option_4, correct_answer, is_active) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    
    foreach ($questions as $index => $question_data) {
        try {
            // Validate required fields for each question
            $required_fields = ['category', 'question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_answer'];
            foreach ($required_fields as $field) {
                if (!isset($question_data[$field])) {
                    throw new Exception("Field '$field' is required at index $index");
                }
            }
            
            $category = $question_data['category'];
            $question = $question_data['question'];
            $option_1 = $question_data['option_1'];
            $option_2 = $question_data['option_2'];
            $option_3 = $question_data['option_3'];
            $option_4 = $question_data['option_4'];
            $correct_answer = (int)$question_data['correct_answer'];
            $is_active = isset($question_data['is_active']) ? (int)$question_data['is_active'] : 1;
            
            // Validate category
            $valid_categories = ['mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block'];
            if (!in_array($category, $valid_categories)) {
                throw new Exception("Invalid category at index $index");
            }
            
            // Validate correct answer (should be 0-3)
            if ($correct_answer < 0 || $correct_answer > 3) {
                throw new Exception("Correct answer must be between 0 and 3 at index $index");
            }
            
            $result = $stmt->execute([$category, $question, $option_1, $option_2, $option_3, $option_4, $correct_answer, $is_active]);
            
            if ($result) {
                $added_count++;
            } else {
                $failed_count++;
                $errors[] = "Failed to add question at index $index";
            }
        } catch (Exception $e) {
            $failed_count++;
            $errors[] = "Error at index $index: " . $e->getMessage();
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Bulk upload completed. Added: $added_count, Failed: $failed_count",
        'added_count' => $added_count,
        'failed_count' => $failed_count,
        'errors' => $errors
    ]);
}

function updateQuestion($db, $input) {
    // Validate required fields
    $required_fields = ['id', 'category', 'question', 'option_1', 'option_2', 'option_3', 'option_4', 'correct_answer'];
    foreach ($required_fields as $field) {
        if (!isset($input[$field])) {
            http_response_code(400);
            echo json_encode(['error' => "$field is required"]);
            return;
        }
    }
    
    $id = (int)$input['id'];
    $category = $input['category'];
    $question = $input['question'];
    $option_1 = $input['option_1'];
    $option_2 = $input['option_2'];
    $option_3 = $input['option_3'];
    $option_4 = $input['option_4'];
    $correct_answer = (int)$input['correct_answer'];
    $is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;
    
    // Validate category
    $valid_categories = ['mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block'];
    if (!in_array($category, $valid_categories)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid category']);
        return;
    }
    
    // Validate correct answer (should be 0-3)
    if ($correct_answer < 0 || $correct_answer > 3) {
        http_response_code(400);
        echo json_encode(['error' => 'Correct answer must be between 0 and 3']);
        return;
    }
    
    try {
        $sql = "UPDATE question_bank SET category=?, question=?, option_1=?, option_2=?, option_3=?, option_4=?, correct_answer=?, is_active=? WHERE id=?";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$category, $question, $option_1, $option_2, $option_3, $option_4, $correct_answer, $is_active, $id]);
        
        if ($result) {
            if ($stmt->rowCount() > 0) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Question updated successfully'
                ]);
            } else {
                // Check if question exists
                $checkStmt = $db->prepare("SELECT id FROM question_bank WHERE id = ?");
                $checkStmt->execute([$id]);
                if ($checkStmt->fetch()) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Question updated successfully (No changes detected)'
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['error' => 'Question not found']);
                }
            }
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update question']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function deleteQuestion($db, $input) {
    $id = (int)$input['id'];
    
    if (!$id) {
        http_response_code(400);
        echo json_encode(['error' => 'ID is required']);
        return;
    }
    
    try {
        $sql = "DELETE FROM question_bank WHERE id=?";
        $stmt = $db->prepare($sql);
        $result = $stmt->execute([$id]);
        
        if ($result && $stmt->rowCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Question deleted successfully'
            ]);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Question not found']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function getQuestions($db, $category = '') {
    try {
        if ($category) {
            // Validate category
            $valid_categories = ['mixed', 'spad', 'rhs', 'loco', 'automatic-signaling', 'modified-signaling', 'absolute-block'];
            if (!in_array($category, $valid_categories)) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid category']);
                return;
            }
            
            $sql = "SELECT * FROM question_bank WHERE category = ? ORDER BY id DESC";
            $stmt = $db->prepare($sql);
            $stmt->execute([$category]);
        } else {
            $sql = "SELECT * FROM question_bank ORDER BY id DESC";
            $stmt = $db->query($sql);
        }
        
        $questions = $stmt->fetchAll();
        
        echo json_encode([
            'success' => true,
            'questions' => $questions,
            'count' => count($questions)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}

function getQuestionStats($db) {
    try {
        $sql = "SELECT category, COUNT(*) as count FROM question_bank GROUP BY category";
        $stmt = $db->query($sql);
        $stats = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $formattedStats = [];
        $total = 0;
        
        foreach ($stats as $stat) {
            $formattedStats[$stat['category']] = (int)$stat['count'];
            $total += (int)$stat['count'];
        }
        
        echo json_encode([
            'success' => true,
            'stats' => $formattedStats,
            'total' => $total
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
