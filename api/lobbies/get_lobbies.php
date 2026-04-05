<?php
require_once '../config/db_config.php';

$response = ['success' => false, 'message' => '', 'data' => []];

try {
    $pdo = getDBConnection();
    
    $division = $_GET['division'] ?? $_GET['division_id'] ?? null;
    
    // Hardcoded Division ID to Name Mapping based on user feedback/context
    // 1=JP (Jaipur), 2=AII (Ajmer), 3=JU (Jodhpur), 4=BKN (Bikaner)
    $divisionMap = [
        1 => 'jaipur',
        2 => 'ajmer',
        3 => 'jodhpur',
        4 => 'bikaner'
    ];
    
    // Reverse map for querying
    $divisionIdMap = array_flip($divisionMap);

    if ($division) {
        // Resolve input to ID or Name
        $targetId = null;
        $targetName = null;
        
        if (is_numeric($division)) {
            $targetId = $division;
            $targetName = $divisionMap[$division] ?? null;
        } else {
            $targetName = strtolower($division);
            $targetId = $divisionIdMap[$targetName] ?? null;
        }
        
        $sql = "SELECT * FROM lobbies WHERE is_active = 1";
        $params = [];
        
        $conditions = [];
        if ($targetId) {
            $conditions[] = "division_id = ?";
            $params[] = $targetId;
        }
        // Also check string column if exists
        $conditions[] = "division = ?";
        $params[] = $targetName ?? $division;
        
        $sql .= " AND (" . implode(" OR ", $conditions) . ")";
        $sql .= " ORDER BY name ASC";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
    } else {
        $stmt = $pdo->query("SELECT * FROM lobbies WHERE is_active = 1 ORDER BY name ASC");
    }
    
    $lobbies = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Post-process to ensure 'division' string exists for frontend grouping
    foreach ($lobbies as &$lobby) {
        if (empty($lobby['division']) && !empty($lobby['division_id'])) {
            $lobby['division'] = $divisionMap[$lobby['division_id']] ?? 'unknown';
        }
    }
    
    $response['success'] = true;
    $response['data'] = $lobbies;
    
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
    http_response_code(500);
}

echo json_encode($response);
?>
