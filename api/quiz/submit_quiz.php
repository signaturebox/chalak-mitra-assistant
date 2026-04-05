<?php
/**
 * Submit Quiz API
 */

require_once '../config/db_config.php';

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validate required fields
        $required_fields = ['user_id', 'quiz_topic', 'total_questions', 'correct_answers', 'quiz_data'];
        foreach ($required_fields as $field) {
            if (!isset($input[$field])) {
                http_response_code(400);
                echo json_encode(['error' => "$field is required"]);
                exit();
            }
        }
        
        $user_id = $input['user_id'];
        $quiz_topic = $input['quiz_topic'];
        $total_questions = $input['total_questions'];
        $correct_answers = $input['correct_answers'];
        $quiz_data = json_encode($input['quiz_data']); // Store as JSON
        $score = round(($correct_answers / $total_questions) * 100, 2);
        $is_passed = $correct_answers >= 6 ? 1 : 0; // Using 6/10 as passing threshold
        
        // Get crew details from input (if provided) - fallback to user record if not provided
        $cms_id = $input['cms_id'] ?? null;
        $crew_name = $input['crew_name'] ?? null;
        $division = $input['division'] ?? null;
        $lobby = $input['lobby'] ?? null;
        
        // Validate user exists
        $userStmt = $db->prepare("SELECT id, cms_id as user_cms_id, name as user_name, division as user_division, lobby as user_lobby FROM users WHERE id = ?");
        $userStmt->execute([$user_id]);
        $user = $userStmt->fetch();
        
        if (!$user) {
            http_response_code(404);
            echo json_encode(['error' => 'User not found']);
            exit();
        }
        
        // Use provided crew details, fallback to user details if not provided
        $final_cms_id = $cms_id ?: $user['user_cms_id'];
        $final_crew_name = $crew_name ?: $user['user_name'];
        $final_division = $division ?: $user['user_division'];
        $final_lobby = $lobby ?: $user['user_lobby'];
        
        // Insert quiz attempt
        // We insert cms_id, crew_name, division, lobby into quiz_attempts
        $stmt = $db->prepare("INSERT INTO quiz_attempts (user_id, cms_id, crew_name, division, lobby, quiz_topic, total_questions, correct_answers, score, quiz_data, is_passed, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");
        $result = $stmt->execute([
            $user_id,
            $final_cms_id,
            $final_crew_name,
            $final_division,
            $final_lobby,
            $quiz_topic,
            $total_questions,
            $correct_answers,
            $score,
            $quiz_data,
            $is_passed
        ]);
        
        if ($result) {
            $attempt_id = $db->lastInsertId();
            $response = [
                'success' => true,
                'message' => 'Quiz submitted successfully',
                'attempt_id' => $attempt_id,
                'score' => $score,
                'is_passed' => $is_passed,
                'correct_answers' => $correct_answers,
                'total_questions' => $total_questions
            ];
            
            // If passed, generate certificate
            if ($is_passed) {
                $certificate_id = 'NWR-CM-' . date('Ymd') . '-' . str_pad($attempt_id, 6, '0', STR_PAD_LEFT);
                
                // Update the quiz attempt with certificate ID
                $certStmt = $db->prepare("UPDATE quiz_attempts SET certificate_id = ? WHERE id = ?");
                $certStmt->execute([$certificate_id, $attempt_id]);
                
                // Create certificate record
                $certInsertStmt = $db->prepare("INSERT INTO certificates (certificate_id, user_id, quiz_attempt_id, division, lobby, score, issued_at) VALUES (?, ?, ?, ?, ?, ?, NOW())");
                $certInsertStmt->execute([
                    $certificate_id,
                    $user_id,
                    $attempt_id,
                    $final_division,
                    $final_lobby,
                    $score
                ]);
                
                $response['certificate_id'] = $certificate_id;
            }
            
            // Trigger system update for real-time sync
            updateSystemModule($db, 'quiz_results');
            
            echo json_encode($response);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to submit quiz']);
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