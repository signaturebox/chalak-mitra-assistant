<?php
require_once '../config/db_config.php';

// Initialize response
$response = ['success' => false, 'message' => '', 'data' => null, 'debug' => []];

// Helper to add debug info
function addDebug(&$response, $msg) {
    $response['debug'][] = $msg;
}

try {
    $pdo = getDBConnection();
    
    // Check if table exists and create if not
    try {
        $pdo->query("SELECT 1 FROM lobbies LIMIT 1");
    } catch (PDOException $e) {
        // Table doesn't exist, create it
        // We use 'division' (string) to match frontend usage
        $sql = "CREATE TABLE IF NOT EXISTS `lobbies` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `name` varchar(100) NOT NULL,
          `division` varchar(100) NOT NULL,
          `division_id` int(11) DEFAULT NULL,
          `is_active` tinyint(1) NOT NULL DEFAULT 1,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          UNIQUE KEY `unique_lobby` (`name`, `division`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sql);
    }

    // Ensure 'division' column exists (migration for existing table)
    try {
        $pdo->query("SELECT division FROM lobbies LIMIT 1");
    } catch (PDOException $e) {
        $pdo->exec("ALTER TABLE lobbies ADD COLUMN division VARCHAR(100) NOT NULL DEFAULT ''");
    }

    $method = $_SERVER['REQUEST_METHOD'];
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'POST') {
        // Create Lobby
        if (!isset($input['name']) || !isset($input['division'])) {
            throw new Exception("Name and Division required");
        }
        
        $name = trim($input['name']);
        $division = trim($input['division']);
        
        // Additional validation
        if (empty($name)) {
            throw new Exception("Lobby name cannot be empty");
        }
        
        // Debug logging
        addDebug($response, "Adding lobby: name='$name', division='$division'");
        addDebug($response, "Input: " . json_encode($input));
        
        // Map division name to ID if possible
        $divisionMap = [
            'jaipur' => 1,
            'ajmer' => 2,
            'jodhpur' => 3,
            'bikaner' => 4
        ];
        $divisionId = $divisionMap[strtolower($division)] ?? null;

        // Check if exists (using division name OR ID)
        $sql = "SELECT id FROM lobbies WHERE name = ?";
        $params = [$name];
        
        if ($divisionId) {
            $sql .= " AND (division = ? OR division_id = ?)";
            $params[] = $division;
            $params[] = $divisionId;
        } else {
            $sql .= " AND division = ?";
            $params[] = $division;
        }
        
        // Debug: Show all lobbies in this division
        $checkDiv = $divisionId ?: 0;
        $allLobbiesStmt = $pdo->prepare("SELECT id, name, division, division_id FROM lobbies WHERE division = ? OR division_id = ?");
        $allLobbiesStmt->execute([$division, $checkDiv]);
        $allLobbies = $allLobbiesStmt->fetchAll(PDO::FETCH_ASSOC);
        addDebug($response, "All lobbies in division '$division' (ID: $checkDiv): " . json_encode($allLobbies));
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $existing = $stmt->fetch();
        addDebug($response, "Duplicate check SQL: $sql");
        addDebug($response, "Params: " . json_encode($params));
        addDebug($response, "Found: " . ($existing ? json_encode($existing) : 'no'));
        if ($existing) {
            throw new Exception("Lobby already exists in this division (found: " . json_encode($existing) . ")");
        }
        
        // Insert
        // Use COALESCE to insert both if available
        try {
            // Generate a unique code for the lobby (division_id + first 3 chars of name)
            $lobbyCode = $divisionId . '-' . substr(strtoupper(preg_replace('/[^a-zA-Z0-9]/', '', $name)), 0, 3);
            addDebug($response, "Generated lobby code: $lobbyCode");
            
            // Check if code column exists
            $codeColCheck = $pdo->query("SHOW COLUMNS FROM lobbies LIKE 'code'");
            $hasCodeColumn = $codeColCheck->fetch();
            
            if ($divisionId) {
                // Check if division_id column exists
                $colCheck = $pdo->query("SHOW COLUMNS FROM lobbies LIKE 'division_id'");
                if ($colCheck->fetch()) {
                    if ($hasCodeColumn) {
                        $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, division_id, code, is_active) VALUES (?, ?, ?, ?, 1)");
                        $stmt->execute([$name, $division, $divisionId, $lobbyCode]);
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, division_id, is_active) VALUES (?, ?, ?, 1)");
                        $stmt->execute([$name, $division, $divisionId]);
                    }
                } else {
                    // Column missing, insert without it
                    if ($hasCodeColumn) {
                        $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, code, is_active) VALUES (?, ?, ?, 1)");
                        $stmt->execute([$name, $division, $lobbyCode]);
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, is_active) VALUES (?, ?, 1)");
                        $stmt->execute([$name, $division]);
                    }
                }
            } else {
                if ($hasCodeColumn) {
                    $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, code, is_active) VALUES (?, ?, ?, 1)");
                    $stmt->execute([$name, $division, $lobbyCode]);
                } else {
                    $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, is_active) VALUES (?, ?, 1)");
                    $stmt->execute([$name, $division]);
                }
            }
        } catch (PDOException $e) {
            // Handle duplicate entry specifically or other SQL errors
            addDebug($response, "PDOException: " . $e->getMessage() . ", Code: " . $e->getCode());
            if ($e->getCode() == 23000) {
                throw new Exception("Lobby already exists (Duplicate entry)");
            }
            throw $e;
        }
        
        $response['success'] = true;
        $response['message'] = "Lobby created successfully";
        $response['data'] = ['id' => $pdo->lastInsertId()];
        
    } elseif ($method === 'PUT') {
        // Update Lobby
        if (!isset($input['id'])) {
            throw new Exception("Lobby ID required");
        }
        
        $id = $input['id'];
        $updates = [];
        $params = [];
        
        if (isset($input['name'])) {
            $updates[] = "name = ?";
            $params[] = trim($input['name']);
        }
        if (isset($input['division'])) {
            $updates[] = "division = ?";
            $params[] = trim($input['division']);
        }
        
        if (empty($updates)) {
            throw new Exception("No fields to update");
        }
        
        $params[] = $id;
        
        $sql = "UPDATE lobbies SET " . implode(', ', $updates) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        
        $response['success'] = true;
        $response['message'] = "Lobby updated successfully";
        
    } elseif ($method === 'DELETE') {
        // Delete Lobby
        $id = $_GET['id'] ?? $input['id'] ?? null;
        
        if (!$id) {
            throw new Exception("Lobby ID required");
        }
        
        $stmt = $pdo->prepare("DELETE FROM lobbies WHERE id = ?");
        $stmt->execute([$id]);
        
        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = "Lobby deleted successfully";
        } else {
            throw new Exception("Lobby not found");
        }
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    $response['error'] = $e->getMessage(); // For ApiService compatibility
    http_response_code(400);
}

echo json_encode($response);
?>