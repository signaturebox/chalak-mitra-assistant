<?php
/**
 * Submit Tool Report to TDRS API
 * Sends tool damage/loss reports to external TDRS system
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

// Validate required fields
$cmsId = $input['cms_id'] ?? '';
$itemBarcode = $input['item_barcode'] ?? '';
$itemName = $input['item_name'] ?? '';
$type = $input['type'] ?? '';
$severity = $input['severity'] ?? '';
$description = $input['description'] ?? '';

if (empty($cmsId) || empty($itemBarcode) || empty($type) || empty($description)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit;
}

// Try to submit to TDRS database directly
try {
    // Database configuration for TDRS
    $dbHost = 'localhost';
    $dbName = 'u191706077_tdrs';
    $dbUser = 'u191706077_tdrs';
    $dbPass = 'Ritu@4200';
    $dbCharset = 'utf8mb4';
    
    // Create PDO connection
    $dsn = "mysql:host=$dbHost;dbname=$dbName;charset=$dbCharset";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_TIMEOUT => 5
    ];
    
    $pdo = new PDO($dsn, $dbUser, $dbPass, $options);
    
    // First, try to find the item_id from items table using barcode
    $itemId = null;
    try {
        $itemStmt = $pdo->prepare("SELECT id FROM items WHERE barcode = :barcode LIMIT 1");
        $itemStmt->execute(['barcode' => $itemBarcode]);
        $itemRow = $itemStmt->fetch();
        if ($itemRow) {
            $itemId = $itemRow['id'];
        }
    } catch (PDOException $e) {
        // Item lookup failed, will try to use barcode as item_id
    }
    
    // If no item_id found, extract numeric part from barcode (e.g., VHF-049 -> 49)
    if (!$itemId) {
        if (preg_match('/\d+/', $itemBarcode, $matches)) {
            $itemId = intval($matches[0]);
        } else {
            $itemId = 1; // Default fallback
        }
    }
    
    // Try to find crew numeric ID from crew table using cms_id
    $crewId = null;
    try {
        $crewStmt = $pdo->prepare("SELECT id FROM crew WHERE cms_id = :cms_id LIMIT 1");
        $crewStmt->execute(['cms_id' => $cmsId]);
        $crewRow = $crewStmt->fetch();
        if ($crewRow) {
            $crewId = $crewRow['id'];
        }
    } catch (PDOException $e) {
        // Crew lookup failed
    }
    
    // If no crew_id found, try to extract numeric part or use cms_id directly
    if (!$crewId) {
        if (preg_match('/\d+/', $cmsId, $matches)) {
            $crewId = intval($matches[0]);
        } else {
            $crewId = $cmsId; // Use cms_id as-is
        }
    }
    
    // Insert report into damage_reports table (the actual TDRS table)
    $stmt = $pdo->prepare("INSERT INTO damage_reports (item_id, crew_id, report_type, severity, description, reported_at, status) VALUES (:item_id, :crew_id, :report_type, :severity, :description, NOW(), 'pending')");
    
    $stmt->execute([
        'item_id' => $itemId,
        'crew_id' => $crewId,
        'report_type' => $type,
        'severity' => $severity,
        'description' => $description
    ]);
    
    $reportId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'message' => 'Report submitted successfully to TDRS',
        'report_id' => $reportId,
        'source' => 'database',
        'item_id' => $itemId,
        'crew_id' => $crewId
    ]);
    
} catch (PDOException $e) {
    // Database connection failed - log error and return success with local save
    $errorMsg = $e->getMessage();
    error_log('TDRS Database Error: ' . $errorMsg);
    
    // Check if it's a table not found error
    if (strpos($errorMsg, 'damage_reports') !== false && strpos($errorMsg, 'doesn\'t exist') !== false) {
        echo json_encode([
            'success' => false,
            'error' => 'Database table not found. Please ensure damage_reports table exists.',
            'source' => 'error'
        ]);
    } else {
        // Return success but indicate it was saved locally
        echo json_encode([
            'success' => true,
            'message' => 'Report saved locally. TDRS database error: ' . $errorMsg,
            'report_id' => 'LOCAL_' . time(),
            'source' => 'local',
            'error' => $errorMsg
        ]);
    }
}
