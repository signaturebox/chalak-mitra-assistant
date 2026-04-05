<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!isset($input['user_id']) || !isset($input['entry_data'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing user_id or entry_data']);
            exit();
        }
        
        $userId = $input['user_id'];
        $entryData = $input['entry_data'];
        
        // Extract core fields
        $cmsId = $entryData['cmsId'] ?? null;
        $date = $entryData['date'] ?? null;
        $trainNo = $entryData['trainNo'] ?? null;
        $locoNo = $entryData['locoNo'] ?? null;
        $fromStation = $entryData['fromStation'] ?? null;
        $toStation = $entryData['toStation'] ?? null;
        $signOn = $entryData['signOn'] ?? null;
        $signOff = $entryData['signOff'] ?? null;
        
        $logDataJson = json_encode($entryData);
        
        // Check if updating existing DB entry
        if (isset($entryData['id']) && is_numeric($entryData['id']) && $entryData['id'] < 2147483647) {
             $stmt = $db->prepare("UPDATE user_logbooks SET 
                entry_date = ?, train_no = ?, loco_no = ?, from_station = ?, to_station = ?, 
                sign_on = ?, sign_off = ?, log_data = ? 
                WHERE id = ? AND user_id = ?");
             
             $stmt->execute([
                 $date, $trainNo, $locoNo, $fromStation, $toStation, 
                 $signOn, $signOff, $logDataJson,
                 $entryData['id'], $userId
             ]);
             
             if ($stmt->rowCount() > 0) {
                 echo json_encode(['success' => true, 'message' => 'Entry updated', 'id' => $entryData['id']]);
                 exit();
             }
             // If rowCount is 0, it might mean data didn't change OR id not found.
             // If ID not found, we should insert. But how do we distinguish?
             // We can check if ID exists first.
             $check = $db->prepare("SELECT id FROM user_logbooks WHERE id = ? AND user_id = ?");
             $check->execute([$entryData['id'], $userId]);
             if ($check->fetch()) {
                 // ID exists, so it was just no-change update
                 echo json_encode(['success' => true, 'message' => 'Entry updated (no changes)', 'id' => $entryData['id']]);
                 exit();
             }
        }
        
        // Insert new entry
        $stmt = $db->prepare("INSERT INTO user_logbooks 
            (user_id, cms_id, entry_date, train_no, loco_no, from_station, to_station, sign_on, sign_off, log_data) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
        $stmt->execute([
            $userId, $cmsId, $date, $trainNo, $locoNo, $fromStation, $toStation, 
            $signOn, $signOff, $logDataJson
        ]);
        
        $newId = $db->lastInsertId();
        
        echo json_encode(['success' => true, 'message' => 'Entry created', 'id' => $newId]);
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
