<?php
require_once '../config/db_config.php';

header('Content-Type: application/json');

try {
    $db = getDBConnection();
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $user_id = $_GET['user_id'] ?? null;
        
        if (!$user_id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Missing user_id']);
            exit();
        }
        
        $result = [];
        
        // 1. Fetch from new table (user_logbooks)
        try {
            $stmt = $db->prepare("SELECT id, user_id, cms_id, entry_date, train_no, loco_no, from_station, to_station, sign_on, sign_off, log_data, created_at FROM user_logbooks WHERE user_id = ? ORDER BY entry_date DESC, sign_on DESC");
            $stmt->execute([$user_id]);
            $entries = $stmt->fetchAll();
            
            foreach ($entries as $entry) {
                $logData = [];
                if ($entry['log_data']) {
                    $logData = json_decode($entry['log_data'], true);
                }
                
                // Start with logData
                $merged = is_array($logData) ? $logData : [];
                
                // Add DB fields
                $merged['id'] = $entry['id'];
                $merged['userId'] = $entry['user_id'];
                $merged['cmsId'] = $entry['cms_id'];
                $merged['date'] = $entry['entry_date'];
                $merged['trainNo'] = $entry['train_no'] ?: ($merged['trainNo'] ?? '');
                $merged['locoNo'] = $entry['loco_no'] ?: ($merged['locoNo'] ?? '');
                $merged['fromStation'] = $entry['from_station'] ?: ($merged['fromStation'] ?? '');
                $merged['toStation'] = $entry['to_station'] ?: ($merged['toStation'] ?? '');
                $merged['signOn'] = $entry['sign_on'] ?: ($merged['signOn'] ?? '');
                $merged['signOff'] = $entry['sign_off'] ?: ($merged['signOff'] ?? '');
                $merged['source'] = 'new';
                
                $result[] = $merged;
            }
        } catch (Exception $e) {
            // Table might not exist or error, continue
        }
        
        // 2. Fetch from legacy table (logbook_entries) if it exists
        try {
            // Check if table exists first to avoid error
            $checkTable = $db->query("SHOW TABLES LIKE 'logbook_entries'");
            if ($checkTable->rowCount() > 0) {
                // Determine columns dynamically or assume standard set based on user screenshot
                // Columns from screenshot: id, user_id, cms_id, date, duty_type, train_no, loco_no, shed_done, shed_due, remarks, sign_on_time, sign_off_time, from_station, to_station, departure_time, arrival_time, cto_time, cmo_time
                
                $stmt = $db->prepare("SELECT * FROM logbook_entries WHERE user_id = ? ORDER BY date DESC");
                $stmt->execute([$user_id]);
                $legacyEntries = $stmt->fetchAll();
                
                foreach ($legacyEntries as $entry) {
                    // Map legacy columns to new structure
                    $mapped = [
                        'id' => 'LEGACY_' . $entry['id'], // Prefix ID to avoid collision
                        'originalId' => $entry['id'],
                        'userId' => $entry['user_id'],
                        'cmsId' => $entry['cms_id'],
                        'date' => $entry['date'],
                        'dutyType' => $entry['duty_type'] ?? '',
                        'trainNo' => $entry['train_no'] ?? '',
                        'locoNo' => $entry['loco_no'] ?? '',
                        'shedDone' => $entry['shed_done'] ?? '',
                        'shedDue' => $entry['shed_due'] ?? '',
                        'remarksIC' => $entry['remarks'] ?? '',
                        'signOn' => $entry['sign_on_time'] ?? '',
                        'signOff' => $entry['sign_off_time'] ?? '',
                        'fromStation' => $entry['from_station'] ?? '',
                        'toStation' => $entry['to_station'] ?? '',
                        'departTime' => $entry['departure_time'] ?? '',
                        'arrTime' => $entry['arrival_time'] ?? '',
                        'cto' => $entry['cto_time'] ?? '',
                        'cmo' => $entry['cmo_time'] ?? '',
                        'source' => 'legacy'
                    ];
                    
                    $result[] = $mapped;
                }
            }
        } catch (Exception $e) {
            // Ignore legacy fetch errors
        }
        
        // Sort combined result by date desc
        usort($result, function($a, $b) {
            return strtotime($b['date']) - strtotime($a['date']);
        });
        
        echo json_encode(['success' => true, 'entries' => $result]);
        
    } else {
        http_response_code(405);
        echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}
?>
