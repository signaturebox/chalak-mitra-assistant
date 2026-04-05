<?php
/**
 * RRMS Running Room API Proxy
 * Fetches running room data from external RRMS system
 */

// Enable CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get request body
$input = json_decode(file_get_contents('php://input'), true);
$cmsId = $input['cms_id'] ?? '';

if (empty($cmsId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'CMS ID is required']);
    exit;
}

// RRMS API endpoint - using GET with query parameter
$rrmsApiUrl = 'https://rrms.ritutechno.com/crew-portal?cms_id=' . urlencode($cmsId);

// Initialize cURL session
$ch = curl_init();

// Set cURL options - using GET request
curl_setopt_array($ch, [
    CURLOPT_URL => $rrmsApiUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_HTTPHEADER => [
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language: en-US,en;q=0.5',
        'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    ]
]);

// Execute request
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Check for cURL errors
if ($error) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to connect to RRMS API: ' . $error
    ]);
    exit;
}

// Check HTTP status
if ($httpCode !== 200) {
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'RRMS API returned HTTP ' . $httpCode
    ]);
    exit;
}

// Parse response
$data = json_decode($response, true);

// If RRMS returns HTML (login page), try to parse it
if ($data === null && strpos($response, '<html') !== false) {
    // Try to parse HTML table
    $roomData = parseRrmsHtmlResponse($response);
    
    if (!empty($roomData)) {
        echo json_encode([
            'success' => true,
            'data' => $roomData,
            'source' => 'parsed_html'
        ]);
        exit;
    }
    
    // RRMS returned HTML page - likely needs login
    echo json_encode([
        'success' => true,
        'data' => [],
        'message' => 'RRMS system requires authentication. Please login at the RRMS portal first.',
        'rrms_url' => 'https://rrms.ritutechno.com/crew-portal'
    ]);
    exit;
}

// If response is not JSON, try to extract data
if ($data === null) {
    // Try to parse as plain text or HTML table
    $roomData = parseRrmsHtmlResponse($response);
    
    if (!empty($roomData)) {
        echo json_encode([
            'success' => true,
            'data' => $roomData,
            'source' => 'parsed_html'
        ]);
        exit;
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid response from RRMS API',
        'debug' => substr($response, 0, 500)
    ]);
    exit;
}

// Return successful response
echo json_encode([
    'success' => true,
    'data' => $data['records'] ?? $data['data'] ?? $data ?? []
]);

/**
 * Parse HTML response from RRMS to extract running room data
 * This is a fallback in case the API returns HTML instead of JSON
 */
function parseRrmsHtmlResponse($html) {
    $records = [];
    
    // Try to find table rows with running room data
    if (preg_match_all('/<tr[^>]*>(.*?)<\/tr>/s', $html, $rows)) {
        foreach ($rows[1] as $row) {
            // Extract cells from row
            if (preg_match_all('/<td[^>]*>(.*?)<\/td>/s', $row, $cells)) {
                $cellData = array_map(function($cell) {
                    return trim(strip_tags($cell));
                }, $cells[1]);
                
                // Check if this looks like running room data
                if (count($cellData) >= 3) {
                    $records[] = [
                        'date' => $cellData[0] ?? '',
                        'train_no' => $cellData[1] ?? '',
                        'from_station' => $cellData[2] ?? '',
                        'to_station' => $cellData[3] ?? '',
                        'room_no' => $cellData[4] ?? '',
                        'status' => $cellData[5] ?? 'Active'
                    ];
                }
            }
        }
    }
    
    return $records;
}
