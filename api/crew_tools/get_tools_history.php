<?php
/**
 * TDRS Crew Tools History API Proxy
 * Fetches tool history from external TDRS system
 * Supports both HTTP request and direct database connection
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
$useDatabase = $input['use_database'] ?? false; // Option to use direct DB connection

if (empty($cmsId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'CMS ID is required']);
    exit;
}

// Try direct database connection first if enabled
if ($useDatabase) {
    $dbResult = fetchFromDatabase($cmsId);
    if ($dbResult['success']) {
        echo json_encode($dbResult);
        exit;
    }
    // If DB fails, fall through to HTTP request
}

// TDRS API endpoint - using GET with query parameter as per user requirement
$tdrsApiUrl = 'https://tdrs.ritutechno.com/crew-portal.php?cms_id=' . urlencode($cmsId);

// Initialize cURL session
$ch = curl_init();

// Set cURL options - using GET request
curl_setopt_array($ch, [
    CURLOPT_URL => $tdrsApiUrl,
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
    // Try database as fallback
    $dbResult = fetchFromDatabase($cmsId);
    if ($dbResult['success']) {
        echo json_encode($dbResult);
        exit;
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to connect to TDRS API: ' . $error
    ]);
    exit;
}

// Check HTTP status
if ($httpCode !== 200) {
    // Try database as fallback
    $dbResult = fetchFromDatabase($cmsId);
    if ($dbResult['success']) {
        echo json_encode($dbResult);
        exit;
    }
    
    http_response_code(502);
    echo json_encode([
        'success' => false,
        'error' => 'TDRS API returned HTTP ' . $httpCode
    ]);
    exit;
}

// Parse response
$data = json_decode($response, true);

// If TDRS returns HTML (login page), try to parse it or use database
if ($data === null && strpos($response, '<html') !== false) {
    // Try to parse HTML table
    $toolsData = parseTdrsHtmlResponse($response);
    
    if (!empty($toolsData)) {
        echo json_encode([
            'success' => true,
            'data' => $toolsData,
            'source' => 'parsed_html'
        ]);
        exit;
    }
    
    // Try database as fallback
    $dbResult = fetchFromDatabase($cmsId);
    if ($dbResult['success']) {
        echo json_encode($dbResult);
        exit;
    }
    
    // TDRS returned HTML page - likely needs login
    echo json_encode([
        'success' => true,
        'data' => [],
        'message' => 'TDRS system requires authentication. Please login at the TDRS portal first.',
        'tdrs_url' => 'https://tdrs.ritutechno.com/crew-portal.php'
    ]);
    exit;
}

// If response is not JSON, try to extract data
if ($data === null) {
    // Try to parse as plain text or HTML table
    $toolsData = parseTdrsHtmlResponse($response);
    
    if (!empty($toolsData)) {
        echo json_encode([
            'success' => true,
            'data' => $toolsData,
            'source' => 'parsed_html'
        ]);
        exit;
    }
    
    // Try database as fallback
    $dbResult = fetchFromDatabase($cmsId);
    if ($dbResult['success']) {
        echo json_encode($dbResult);
        exit;
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Invalid response from TDRS API',
        'debug' => substr($response, 0, 500)
    ]);
    exit;
}

// Return successful response
echo json_encode([
    'success' => true,
    'data' => $data['history'] ?? $data['data'] ?? $data ?? []
]);

/**
 * Fetch tools data directly from TDRS database
 * This is used as a fallback when HTTP request fails
 */
function fetchFromDatabase($cmsId) {
    // Database configuration for TDRS
    $dbHost = 'localhost';
    $dbName = 'u191706077_tdrs';
    $dbUser = 'u191706077_tdrs';
    $dbPass = 'Ritu@4200';
    $dbCharset = 'utf8mb4';
    
    try {
        // Create PDO connection
        $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=$dbCharset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_TIMEOUT => 5
        ];
        
        $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
        
        // Query to fetch tools history for the crew member
        // Adjust table and column names based on actual TDRS database schema
        $stmt = $pdo->prepare("SELECT * FROM tools_history WHERE cms_id = :cms_id ORDER BY issued_date DESC");
        $stmt->execute(['cms_id' => $cmsId]);
        $tools = $stmt->fetchAll();
        
        // Format the data to match expected structure
        $formattedTools = [];
        foreach ($tools as $tool) {
            $formattedTools[] = [
                'type' => $tool['transaction_type'] ?? 'Issued',
                'item' => $tool['item_name'] ?? $tool['tool_name'] ?? 'Unknown',
                'barcode' => $tool['barcode'] ?? $tool['serial_number'] ?? '-',
                'date' => $tool['issued_date'] ?? $tool['created_at'] ?? date('c'),
                'status' => $tool['status'] ?? 'Active',
                'category' => $tool['category'] ?? '-',
                'charger' => $tool['charger'] ?? '-'
            ];
        }
        
        return [
            'success' => true,
            'data' => $formattedTools,
            'source' => 'database'
        ];
        
    } catch (PDOException $e) {
        // Database connection failed
        return [
            'success' => false,
            'error' => 'Database connection failed: ' . $e->getMessage()
        ];
    }
}

/**
 * Parse HTML response from TDRS to extract tool data
 * This is a fallback in case the API returns HTML instead of JSON
 */
function parseTdrsHtmlResponse($html) {
    $tools = [];
    
    // Try to find table rows with tool data
    // Pattern 1: Look for table rows
    if (preg_match_all('/<tr[^>]*>(.*?)<\/tr>/s', $html, $rows)) {
        foreach ($rows[1] as $row) {
            // Extract cells from row
            if (preg_match_all('/<td[^>]*>(.*?)<\/td>/s', $row, $cells)) {
                $cellData = array_map(function($cell) {
                    return trim(strip_tags($cell));
                }, $cells[1]);
                
                // Check if this looks like tool data (has expected fields)
                // Based on TDRS portal: ITEM TYPE, ITEM, BARCODE, CHARGER BARCODE, DATE OF ISSUE, DATE OF RETURN, STATUS
                if (count($cellData) >= 6) {
                    $tools[] = [
                        'type' => $cellData[0] ?? 'Issued',
                        'item' => $cellData[1] ?? 'Unknown',
                        'barcode' => $cellData[2] ?? '-',
                        'charger' => $cellData[3] ?? '-',
                        'date' => parseTdrsDate($cellData[4] ?? ''),
                        'return_date' => parseTdrsDate($cellData[5] ?? ''),
                        'status' => $cellData[6] ?? 'Active'
                    ];
                } elseif (count($cellData) >= 4) {
                    // Fallback for simpler format
                    $tools[] = [
                        'type' => $cellData[0] ?? 'Issued',
                        'item' => $cellData[1] ?? 'Unknown',
                        'barcode' => $cellData[2] ?? '-',
                        'charger' => '-',
                        'date' => parseTdrsDate($cellData[3] ?? ''),
                        'return_date' => '',
                        'status' => $cellData[4] ?? 'Active'
                    ];
                }
            }
        }
    }
    
    return $tools;
}

/**
 * Parse date string from TDRS format
 */
function parseTdrsDate($dateStr) {
    // Try various date formats
    $formats = [
        'M d, Y h:i A',
        'M d, Y H:i',
        'Y-m-d H:i:s',
        'd-m-Y H:i:s',
        'm/d/Y h:i A'
    ];
    
    foreach ($formats as $format) {
        $date = DateTime::createFromFormat($format, trim($dateStr));
        if ($date !== false) {
            return $date->format('c');
        }
    }
    
    // Fallback: try strtotime
    $timestamp = strtotime($dateStr);
    if ($timestamp !== false) {
        return date('c', $timestamp);
    }
    
    return date('c');
}
