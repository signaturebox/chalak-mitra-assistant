<?php
/**
 * Push Notifier Helper
 * 
 * Handles sending web push notifications to users based on their subscriptions.
 */

function sendPushToTargetUsers($db, $title, $message, $divisionId = null, $lobbyId = null, $data = []) {
    // 1. Get target division code and lobby name/code for filtering
    $divisionCode = null;
    $divisionName = null;
    if ($divisionId) {
        if (is_numeric($divisionId)) {
            $divStmt = $db->prepare("SELECT code, name FROM divisions WHERE id = ?");
            $divStmt->execute([$divisionId]);
            $div = $divStmt->fetch();
            if ($div) {
                $divisionCode = $div['code'];
                $divisionName = $div['name'];
            } else {
                // Fallback mapping if database table is missing 
                $divisionMap = [1 => 'jaipur', 2 => 'ajmer', 3 => 'jodhpur', 4 => 'bikaner'];
                if (isset($divisionMap[$divisionId])) {
                    $divisionName = $divisionMap[$divisionId];
                }
            }
        } else {
            // divisionId is already a name string
            $divisionName = $divisionId;
        }
    }
    
    $lobbyInfo = null;
    if ($lobbyId) {
        if (is_numeric($lobbyId)) {
            $lobbyStmt = $db->prepare("SELECT name, code, division_id FROM lobbies WHERE id = ?");
            $lobbyStmt->execute([$lobbyId]);
            $lobbyInfo = $lobbyStmt->fetch();
            
            // If we have a lobby but no division, try to find the division from the lobby
            if ($lobbyInfo && !$divisionName && !empty($lobbyInfo['division_id'])) {
                $divStmt = $db->prepare("SELECT code, name FROM divisions WHERE id = ?");
                $divStmt->execute([$lobbyInfo['division_id']]);
                $div = $divStmt->fetch();
                if ($div) {
                    $divisionCode = $div['code'];
                    $divisionName = $div['name'];
                } else {
                    $divisionMap = [1 => 'jaipur', 2 => 'ajmer', 3 => 'jodhpur', 4 => 'bikaner'];
                    if (isset($divisionMap[$lobbyInfo['division_id']])) {
                        $divisionName = $divisionMap[$lobbyInfo['division_id']];
                    }
                }
            }
        } else {
            // lobbyId is already a name string
            $lobbyInfo = ['name' => $lobbyId];
        }
    }
    
    error_log("[PushNotifier] Inputs: divId=$divisionId, lobbyId=$lobbyId. Resolved: divName=$divisionName, lobbyName=" . ($lobbyInfo['name'] ?? 'none'));
    
    // 2. Normalize division name for OneSignal tags (mobile app uses 'bikaner', 'ajmer', etc.)
    $targetDivision = $divisionName ?: $divisionCode;
    if ($targetDivision) {
        $nameLower = strtolower($targetDivision);
        if (strpos($nameLower, 'bikaner') !== false) $targetDivision = 'bikaner';
        elseif (strpos($nameLower, 'ajmer') !== false) $targetDivision = 'ajmer';
        elseif (strpos($nameLower, 'jodhpur') !== false) $targetDivision = 'jodhpur';
        elseif (strpos($nameLower, 'jaipur') !== false) $targetDivision = 'jaipur';
        elseif (strpos($nameLower, 'division') !== false) {
             $targetDivision = trim(str_replace('division', '', $nameLower));
        }
    }

    // Add codes to data for targeting fallback
    $data['division_code'] = $divisionCode;
    if ($lobbyInfo && isset($lobbyInfo['code'])) {
        $data['lobby_code'] = $lobbyInfo['code'];
    }

    // Send OneSignal push notification(s)
    $oneSignalResults = [];
    
    // We prioritize External User IDs (CMS IDs) for targeted notifications as it's the most reliable 
    // and avoids duplicates that happen when mixing tags and external IDs in separate requests.
    
    if ($lobbyInfo && $targetDivision) {
        $lobbyName = $lobbyInfo['name'] ?? null;
        $lobbyCode = $lobbyInfo['code'] ?? null;
        
        // Use External IDs as primary for better reliability and zero duplication for logged-in users
        $result = sendOneSignalPushByExternalIds($db, $title, $message, $targetDivision, $lobbyName, array_merge($data, [
            'division_id' => $divisionId,
            'lobby_id' => $lobbyId,
            'division_code' => $divisionCode,
            'lobby_code' => $lobbyCode,
            'target_type' => 'external_user_ids'
        ]));
        $oneSignalResults[] = $result;
        error_log("[PushNotifier] OneSignal primary delivery (External IDs/Lobby) result: " . json_encode($result));
        
        // ONLY if the above skipped because of no users, or if we really want tag-based fallback 
        // (but disabled for now to stop duplicates)
        /*
        $resultTags = sendOneSignalPush($title, $message, $targetDivision, $lobbyName, $data);
        $oneSignalResults[] = $resultTags;
        */
        
    } elseif ($targetDivision) {
        // Targeted at Division level
        $result = sendOneSignalPushByExternalIds($db, $title, $message, $targetDivision, null, array_merge($data, [
            'division_id' => $divisionId,
            'division_code' => $divisionCode,
            'target_type' => 'external_user_ids'
        ]));
        $oneSignalResults[] = $result;
        error_log("[PushNotifier] OneSignal primary delivery (External IDs/Division) result: " . json_encode($result));
    } else {
        // Global notification (no division/lobby) - use "All" segment
        $result = sendOneSignalPush($title, $message, null, null, array_merge($data, [
            'target_type' => 'global_segment'
        ]));
        $oneSignalResults[] = $result;
        error_log("[PushNotifier] OneSignal global segment delivery result: " . json_encode($result));
    }

    // 3. Query push_subscriptions (Legacy / Web Push fallback)
    $query = "SELECT * FROM push_subscriptions WHERE 1=1";
    $params = [];
    
    if ($divisionCode) {
        $query .= " AND (division = ? OR division IS NULL OR division = 'all')";
        $params[] = $divisionCode;
    }
    
    if ($lobbyInfo) {
        $query .= " AND (lobby = ? OR lobby = ? OR lobby IS NULL OR lobby = 'all')";
        $params[] = $lobbyInfo['name'];
        $params[] = $lobbyInfo['code'];
    }
    
    $stmt = $db->prepare($query);
    $stmt->execute($params);
    $subscriptions = $stmt->fetchAll();
    
    if (empty($subscriptions)) {
        return 1; // Return 1 because OneSignal was already triggered
    }
    
    // 4. Send notifications (logging for now)
    $successCount = 0;
    foreach ($subscriptions as $sub) {
        error_log("[PushNotifier] Sending push to User ID {$sub['user_id']} at {$sub['endpoint']}");
        $successCount++;
    }
    
    return [
        'legacy_count' => $successCount,
        'onesignal' => $oneSignalResults
    ];
}

/**
 * Send push using External User IDs fetched from the database.
 * More reliable than tags when tag syncing has issues.
 */
function sendOneSignalPushByExternalIds($db, $title, $message, $division, $lobby = null, $data = []) {
    $appId = '3f4b9882-4b38-4964-8e3f-67f8a5ac15fa';
    $restKey = 'os_v2_app_h5fzraslhbewjdr7m74kllav7kez2gjru35eccnvjj2pymovxe2bqyqoh7xqnqhkxlzhi2knma5vwlxxjrggjobzvvpau4wgv2lagcy';

    // Query users table for matching users by division (and optionally lobby)
    try {
        if ($lobby && strtolower($lobby) !== 'all') {
            // Target specific lobby users + 'all' lobby users in division
            $whereParts = ["(LOWER(TRIM(lobby)) = LOWER(TRIM(?)) OR lobby LIKE ? OR LOWER(TRIM(lobby)) = 'all')"];
            $params = [trim($lobby), '%' . trim($lobby) . '%'];
            
            if ($division) {
                $whereParts[] = "(LOWER(TRIM(division)) = LOWER(TRIM(?)) OR division LIKE ?)";
                $params[] = trim($division);
                $params[] = '%' . trim($division) . '%';
            }
            
            $sql = "SELECT DISTINCT cms_id FROM users WHERE " . implode(" AND ", $whereParts) . " AND is_active = 1 AND cms_id IS NOT NULL AND cms_id != ''";
            $stmt = $db->prepare($sql);
            $stmt->execute($params);
            error_log("[PushNotifier] Querying users for Lobby: $lobby, Division: " . ($division ?? 'ANY'));
        } elseif ($division && strtolower($division) !== 'all') {
            // Target all users in division
            $stmt = $db->prepare(
                "SELECT DISTINCT cms_id FROM users 
                 WHERE (LOWER(TRIM(division)) = LOWER(TRIM(?)) OR division LIKE ?) 
                 AND is_active = 1 AND cms_id IS NOT NULL AND cms_id != ''"
            );
            $divisionSearch = '%' . trim($division) . '%';
            $stmt->execute([trim($division), $divisionSearch]);
            error_log("[PushNotifier] Querying users for Division: $division ($divisionSearch)");
        } else {
            // No division filter — skip this to avoid broadcasting to all
            return ['skipped' => true, 'reason' => 'No division specified for external_user_ids push'];
        }

        $users = $stmt->fetchAll(PDO::FETCH_COLUMN);
        if (empty($users)) {
            error_log("[PushNotifier] No users found in DB for division='$division' lobby='$lobby'");
            return ['skipped' => true, 'reason' => 'No matching users in database', 'division' => $division];
        }

        error_log("[PushNotifier] Found " . count($users) . " users for external ID push: " . implode(',', array_slice($users, 0, 5)) . "...");

        // OneSignal allows max 2000 external user IDs per request
        $chunks = array_chunk($users, 2000);
        $results = [];

        foreach ($chunks as $chunk) {
            $fields = [
                'app_id' => $appId,
                'headings' => ['en' => $title],
                'contents' => ['en' => $message],
                'data' => $data,
                'include_external_user_ids' => $chunk,
                'channel_for_external_user_ids' => 'push',
                'android_group' => 'nwr_chalak_updates',
                'android_visibility' => 1,
                'priority' => 10
            ];

            $fields_json = json_encode($fields);
            error_log("[PushNotifier] External IDs payload (" . count($chunk) . " users): division=$division");

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json; charset=utf-8',
                'Authorization: Basic ' . $restKey
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($ch, CURLOPT_HEADER, FALSE);
            curl_setopt($ch, CURLOPT_POST, TRUE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_json);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            $logMessage = "[" . date('Y-m-d H:i:s') . "] ExtIDs API ($httpCode): " . $response . PHP_EOL;
            $logPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'push_debug.log';
            file_put_contents($logPath, $logMessage, FILE_APPEND);

            $results[] = [
                'response' => json_decode($response, true) ?: $response,
                'payload' => ['users_count' => count($chunk), 'division' => $division, 'lobby' => $lobby],
                'http_code' => $httpCode,
                'target' => 'external_user_ids'
            ];
        }

        return count($results) === 1 ? $results[0] : $results;

    } catch (Exception $e) {
        error_log("[PushNotifier] External IDs DB error: " . $e->getMessage());
        return ['error' => 'DB error: ' . $e->getMessage()];
    }
}

/**
 * Send push to users with lobby='all' in a specific division
 */
function sendOneSignalPushToAllLobby($title, $message, $division, $data = []) {
    $appId = '3f4b9882-4b38-4964-8e3f-67f8a5ac15fa';
    $restKey = 'os_v2_app_h5fzraslhbewjdr7m74kllav7kez2gjru35eccnvjj2pymovxe2bqyqoh7xqnqhkxlzhi2knma5vwlxxjrggjobzvvpau4wgv2lagcy';
    
    if (empty($restKey) || $restKey === 'YOUR_REST_API_KEY_HERE') {
        error_log("[PushNotifier] ERROR: OneSignal REST API Key is not set.");
        return ['error' => 'OneSignal REST API Key missing'];
    }

    $content = array("en" => $message);
    $headings = array("en" => $title);
    
    $filters = [];
    
    // Division filter
    if ($division && strtolower($division) !== 'all') {
        $divLower = strtolower($division);
        $filters[] = array("field" => "tag", "key" => "division", "relation" => "=", "value" => $divLower);
        
        // Add OR condition for ID if available
        if (isset($data['division_id']) && $data['division_id']) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "division_id", "relation" => "=", "value" => strval($data['division_id']));
        }

        // Add OR condition for code if provided
        $divCode = $data['division_code'] ?? null;
        if ($divCode && strtolower($divCode) !== $divLower) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "division", "relation" => "=", "value" => strtolower($divCode));
        }
        
        // AND with lobby='all'
        $filters[] = array("operator" => "AND");
    }
    
    // Target users with lobby='all'
    $filters[] = array("field" => "tag", "key" => "lobby", "relation" => "=", "value" => "all");
    
    $fields = array(
        'app_id' => $appId,
        'headings' => $headings,
        'contents' => $content,
        'data' => $data,
        'android_group' => 'nwr_chalak_updates',
        'android_visibility' => 1,
        'priority' => 10
    );
    
    if (!empty($filters)) {
        $fields['filters'] = $filters;
    } else {
        $fields['included_segments'] = array('All');
    }
    
    $fields_json = json_encode($fields);
    error_log("[PushNotifier] OneSignal 'all' lobby Payload: " . $fields_json);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json; charset=utf-8',
        'Authorization: Basic ' . $restKey
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_json);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $logMessage = "[" . date('Y-m-d H:i:s') . "] OneSignal 'all' lobby API Response ($httpCode): " . $response . PHP_EOL;
    $payloadLog = "[" . date('Y-m-d H:i:s') . "] OneSignal 'all' lobby Payload: " . $fields_json . PHP_EOL;
    $logPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'push_debug.log';
    file_put_contents($logPath, $payloadLog . $logMessage, FILE_APPEND);
    
    return [
        'response' => json_decode($response, true) ?: $response,
        'payload' => $fields,
        'http_code' => $httpCode,
        'target' => 'all_lobby'
    ];
}

/**
 * Send push using OneSignal REST API
 */
function sendOneSignalPush($title, $message, $division = null, $lobby = null, $data = []) {
    $appId = '3f4b9882-4b38-4964-8e3f-67f8a5ac15fa';
    // IMPORTANT: The USER must provide their REST API Key in their production environment.
    // I am using a placeholder here, but it's where the key goes.
    $restKey = 'os_v2_app_h5fzraslhbewjdr7m74kllav7kez2gjru35eccnvjj2pymovxe2bqyqoh7xqnqhkxlzhi2knma5vwlxxjrggjobzvvpau4wgv2lagcy'; 
    
    if (empty($restKey) || $restKey === 'YOUR_REST_API_KEY_HERE') {
        error_log("[PushNotifier] ERROR: OneSignal REST API Key is not set.");
        return json_encode(['error' => 'OneSignal REST API Key missing']);
    }

    $content = array(
        "en" => $message
    );
    $headings = array(
        "en" => $title
    );
    
    $filters = [];
    if ($division && strtolower($division) !== 'all') {
        $divLower = strtolower($division);
        $filters[] = array("field" => "tag", "key" => "division", "relation" => "=", "value" => $divLower);
        
        // Add OR condition for ID if available
        if (isset($data['division_id']) && $data['division_id']) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "division_id", "relation" => "=", "value" => strval($data['division_id']));
        }

        // Add OR condition for code if provided
        $divCode = $data['division_code'] ?? null;
        if ($divCode && strtolower($divCode) !== $divLower) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "division", "relation" => "=", "value" => strtolower($divCode));
        }
    }

    // Add lobby filter if specified (for specific lobby targeting)
    if ($lobby && strtolower($lobby) !== 'all') {
        if (!empty($filters)) $filters[] = array("operator" => "AND");
        
        $lobbyLower = strtolower($lobby);
        $filters[] = array("field" => "tag", "key" => "lobby", "relation" => "=", "value" => $lobbyLower);
        
        // Add OR condition for ID
        if (isset($data['lobby_id']) && $data['lobby_id']) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "lobby_id", "relation" => "=", "value" => strval($data['lobby_id']));
        }

        // Add OR condition for code if provided
        $lobbyCode = $data['lobby_code'] ?? null;
        if ($lobbyCode && strtolower($lobbyCode) !== $lobbyLower) {
            $filters[] = array("operator" => "OR");
            $filters[] = array("field" => "tag", "key" => "lobby", "relation" => "=", "value" => strtolower($lobbyCode));
        }
    }
    
    $fields = array(
        'app_id' => $appId,
        'headings' => $headings,
        'contents' => $content,
        'data' => $data,
        'android_group' => 'nwr_chalak_updates',
        'android_visibility' => 1, // Public
        'priority' => 10 // High priority
    );
    
    if (!empty($filters)) {
        $fields['filters'] = $filters;
    } else {
        $fields['included_segments'] = array('All');
    }
    
    $fields_json = json_encode($fields);
    error_log("[PushNotifier] OneSignal Payload: " . $fields_json);
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json; charset=utf-8',
        'Authorization: Basic ' . $restKey
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
    curl_setopt($ch, CURLOPT_HEADER, FALSE);
    curl_setopt($ch, CURLOPT_POST, TRUE);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_json);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    $logMessage = "[" . date('Y-m-d H:i:s') . "] OneSignal API Response ($httpCode): " . $response . PHP_EOL;
    $payloadLog = "[" . date('Y-m-d H:i:s') . "] OneSignal Payload: " . $fields_json . PHP_EOL;
    $logPath = dirname(__DIR__, 2) . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'push_debug.log';
    file_put_contents($logPath, $payloadLog . $logMessage, FILE_APPEND);
    
    return [
        'response' => json_decode($response, true) ?: $response,
        'payload' => $fields,
        'http_code' => $httpCode
    ];
}
?>
