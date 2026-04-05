<?php
require_once '../config/db_config.php';

// Initialize response
$response = ['success' => false, 'message' => '', 'data' => null];

try {
    $pdo = getDBConnection();
    
    // Check if table exists and create if not (Self-Migration)
    try {
        $pdo->query("SELECT 1 FROM navigation_tabs LIMIT 1");
    } catch (PDOException $e) {
        // Table doesn't exist, create it
        $sql = "CREATE TABLE IF NOT EXISTS `navigation_tabs` (
          `id` int(11) NOT NULL AUTO_INCREMENT,
          `tab_id` varchar(100) NOT NULL UNIQUE,
          `name` varchar(100) NOT NULL,
          `type` enum('main', 'division', 'lobby') NOT NULL,
          `division_id` int(11) DEFAULT NULL,
          `lobby_id` int(11) DEFAULT NULL,
          `icon` varchar(255) DEFAULT NULL,
          `color` varchar(50) DEFAULT NULL,
          `order_index` int(11) NOT NULL DEFAULT 0,
          `is_active` tinyint(1) NOT NULL DEFAULT 1,
          `created_by` int(11) DEFAULT NULL,
          `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
          `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (`id`),
          KEY `idx_type` (`type`),
          KEY `idx_division` (`division_id`),
          KEY `idx_lobby` (`lobby_id`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        $pdo->exec($sql);
    }

    $method = $_SERVER['REQUEST_METHOD'];
    
    // Get JSON input
    $input = json_decode(file_get_contents('php://input'), true);

    if ($method === 'GET') {
        // Fetch all active tabs
        $stmt = $pdo->prepare("SELECT * FROM navigation_tabs WHERE is_active = 1 ORDER BY order_index ASC, created_at ASC");
        $stmt->execute();
        $tabs = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $response['success'] = true;
        $response['data'] = $tabs;
        
    } elseif ($method === 'POST') {
        // Create new tab
        if (!isset($input['name']) || !isset($input['type'])) {
            throw new Exception("Missing required fields: name, type");
        }
        
        $name = $input['name'];
        $type = $input['type'];
        $divisionId = $input['division_id'] ?? null;
        $lobbyId = $input['lobby_id'] ?? null;
        $icon = $input['icon'] ?? null;
        $color = $input['color'] ?? null;
        $createdBy = $input['user_id'] ?? null; // Should be passed from frontend
        
        // Handle Lobby Name passed as ID (Self-Healing / Auto-Resolve)
        if ($type === 'lobby' && $lobbyId && !is_numeric($lobbyId)) {
            // Check if table 'lobbies' exists first to avoid crash
            try {
                $pdo->query("SELECT 1 FROM lobbies LIMIT 1");
                
                // Try to resolve lobby ID from name
                // If division is provided, use it to narrow down
                $divisionInput = $divisionId; // division_id input might be string name
                
                $sql = "SELECT id FROM lobbies WHERE name = ?";
                $params = [$lobbyId];
                
                if ($divisionInput) {
                     $sql .= " AND (division = ? OR division_id = ?)";
                     $params[] = $divisionInput;
                     $params[] = $divisionInput;
                }
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute($params);
                $row = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($row) {
                    $lobbyId = $row['id'];
                } else {
                    // Auto-create lobby if division is known (Robustness)
                    if ($divisionInput) {
                        try {
                             // Ensure division column exists or fallback
                             $stmt = $pdo->prepare("INSERT INTO lobbies (name, division, is_active) VALUES (?, ?, 1)");
                             $stmt->execute([$lobbyId, $divisionInput]);
                             $lobbyId = $pdo->lastInsertId();
                        } catch (Exception $e) {
                             // Failed to auto-create, maybe table structure mismatch
                        }
                    }
                }
            } catch (PDOException $e) {
                // Lobbies table doesn't exist, can't resolve
            }
        }
        
        // Validate
        if ($type === 'division' && !$divisionId) throw new Exception("Division ID required for division tabs");
        if ($type === 'lobby' && !$lobbyId) throw new Exception("Lobby ID required for lobby tabs");
        
        $prefix = 'dtab_';
        if ($type === 'main') $prefix = 'mtab_';
        if ($type === 'lobby') $prefix = 'ltab_';
        
        $tabId = $input['tab_id'] ?? $prefix . time() . '_' . rand(100, 999);
        
        $stmt = $pdo->prepare("INSERT INTO navigation_tabs (tab_id, name, type, division_id, lobby_id, icon, color, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([$tabId, $name, $type, $divisionId, $lobbyId, $icon, $color, $createdBy]);
        
        $response['success'] = true;
        $response['message'] = "Tab created successfully";
        $response['data'] = ['id' => $pdo->lastInsertId(), 'tab_id' => $tabId];
        
        // Trigger system update for real-time sync
        updateSystemModule($pdo, 'navigation_tabs');
        
    } elseif ($method === 'PUT') {
        // Update existing tab or Bulk Update
        
        // Check for Bulk Update
        if (isset($input['action']) && $input['action'] === 'bulk_update' && isset($input['tabs']) && is_array($input['tabs'])) {
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare("UPDATE navigation_tabs SET order_index = ? WHERE tab_id = ?");
                foreach ($input['tabs'] as $tab) {
                    if (isset($tab['tab_id']) && isset($tab['order_index'])) {
                        $stmt->execute([$tab['order_index'], $tab['tab_id']]);
                    }
                }
                $pdo->commit();
                $response['success'] = true;
                $response['message'] = "Tabs reordered successfully";
                updateSystemModule($pdo, 'navigation_tabs');
            } catch (Exception $e) {
                $pdo->rollBack();
                throw $e;
            }
        } else {
            // Single Tab Update
            if (!isset($input['tab_id'])) {
                throw new Exception("Tab ID required");
            }
            
            $tabId = $input['tab_id'];
            $updates = [];
            $params = [];
            
            if (isset($input['name'])) {
                $updates[] = "name = ?";
                $params[] = $input['name'];
            }
            if (isset($input['icon'])) {
                $updates[] = "icon = ?";
                $params[] = $input['icon'];
            }
            if (isset($input['color'])) {
                $updates[] = "color = ?";
                $params[] = $input['color'];
            }
            if (isset($input['order_index'])) {
                $updates[] = "order_index = ?";
                $params[] = $input['order_index'];
            }
            
            if (empty($updates)) {
                throw new Exception("No fields to update");
            }
            
            $params[] = $tabId;
            
            $sql = "UPDATE navigation_tabs SET " . implode(', ', $updates) . " WHERE tab_id = ?";
            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            
            $response['success'] = true;
            $response['message'] = "Tab updated successfully";
            
            // Trigger system update for real-time sync
            updateSystemModule($pdo, 'navigation_tabs');
        }
        
    } elseif ($method === 'DELETE') {
        // Delete tab (soft delete or hard delete?)
        // Let's do hard delete for now as per user request to "delete function need"
        
        if (!isset($_GET['tab_id'])) {
            throw new Exception("Tab ID required");
        }
        
        $tabId = $_GET['tab_id'];
        
        // Check if tab has files associated?
        // Ideally we should check, but for now we just delete the tab entry
        
        $stmt = $pdo->prepare("DELETE FROM navigation_tabs WHERE tab_id = ?");
        $stmt->execute([$tabId]);
        
        if ($stmt->rowCount() > 0) {
            $response['success'] = true;
            $response['message'] = "Tab deleted successfully";
            
            // Trigger system update for real-time sync
            updateSystemModule($pdo, 'navigation_tabs');
        } else {
            throw new Exception("Tab not found");
        }
    }

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(400); // Bad Request
}

echo json_encode($response);
?>
