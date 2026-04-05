<?php
/**
 * Get Tool Reports from TDRS Database
 * Fetches damage reports for a crew member from external TDRS system
 */

// Enable CORS
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only accept GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

// Get CMS ID from query parameter
$cmsId = $_GET['cms_id'] ?? '';

if (empty($cmsId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing cms_id parameter']);
    exit;
}

// Try to fetch from TDRS database directly
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
    
    // First, try to find crew numeric ID from crew table using cms_id
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
    
    // Build query to fetch reports
    // Try to match by crew_id or cms_id directly
    if ($crewId) {
        $stmt = $pdo->prepare("
            SELECT 
                dr.id,
                dr.item_id,
                dr.crew_id,
                dr.report_type,
                dr.severity,
                dr.description,
                dr.reported_at as created_at,
                dr.status,
                dr.verified_by,
                dr.verified_at,
                i.name as item_name,
                i.barcode as item_barcode
            FROM damage_reports dr
            LEFT JOIN items i ON dr.item_id = i.id
            WHERE dr.crew_id = :crew_id
            ORDER BY dr.reported_at DESC
        ");
        $stmt->execute(['crew_id' => $crewId]);
    } else {
        // If no crew_id found, try matching by cms_id directly or numeric extraction
        // First try to find crew by cms_id
        $crewIdFromCms = null;
        try {
            $crewStmt2 = $pdo->prepare("SELECT id FROM crew WHERE cms_id = :cms_id LIMIT 1");
            $crewStmt2->execute(['cms_id' => $cmsId]);
            $crewRow2 = $crewStmt2->fetch();
            if ($crewRow2) {
                $crewIdFromCms = $crewRow2['id'];
            }
        } catch (PDOException $e) {
            // Crew lookup failed
        }
        
        if ($crewIdFromCms) {
            $stmt = $pdo->prepare("
                SELECT 
                    dr.id,
                    dr.item_id,
                    dr.crew_id,
                    dr.report_type,
                    dr.severity,
                    dr.description,
                    dr.reported_at as created_at,
                    dr.status,
                    dr.verified_by,
                    dr.verified_at,
                    i.name as item_name,
                    i.barcode as item_barcode
                FROM damage_reports dr
                LEFT JOIN items i ON dr.item_id = i.id
                WHERE dr.crew_id = :crew_id
                ORDER BY dr.reported_at DESC
            ");
            $stmt->execute(['crew_id' => $crewIdFromCms]);
        } else {
            // Try matching by crew_id as string (cms_id)
            $stmt = $pdo->prepare("
                SELECT 
                    dr.id,
                    dr.item_id,
                    dr.crew_id,
                    dr.report_type,
                    dr.severity,
                    dr.description,
                    dr.reported_at as created_at,
                    dr.status,
                    dr.verified_by,
                    dr.verified_at,
                    i.name as item_name,
                    i.barcode as item_barcode
                FROM damage_reports dr
                LEFT JOIN items i ON dr.item_id = i.id
                WHERE dr.crew_id = :cms_id
                ORDER BY dr.reported_at DESC
            ");
            $stmt->execute(['cms_id' => $cmsId]);
        }
    }
    
    $reports = $stmt->fetchAll();
    
    // Format reports for frontend
    $formattedReports = array_map(function($report) use ($cmsId) {
        return [
            'id' => 'TDRS_' . $report['id'],
            'tdrs_report_id' => $report['id'],
            'item_barcode' => $report['item_barcode'] ?? 'Unknown',
            'item_name' => $report['item_name'] ?? 'Unknown Item',
            'type' => $report['report_type'],
            'severity' => $report['severity'],
            'description' => $report['description'],
            'status' => $report['status'],
            'created_at' => $report['created_at'],
            'reported_by' => $cmsId,
            'source' => 'tdrs',
            'verified_by' => $report['verified_by'],
            'verified_at' => $report['verified_at']
        ];
    }, $reports);
    
    echo json_encode([
        'success' => true,
        'reports' => $formattedReports,
        'count' => count($formattedReports),
        'source' => 'database'
    ]);
    
} catch (PDOException $e) {
    $errorMsg = $e->getMessage();
    error_log('TDRS Database Error: ' . $errorMsg);
    
    // Log to file for debugging
    $logFile = __DIR__ . '/tdrs_errors.log';
    $logEntry = date('Y-m-d H:i:s') . ' - Get Reports Error: ' . $errorMsg . "\n";
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    echo json_encode([
        'success' => false,
        'error' => 'Database connection failed: ' . $errorMsg,
        'reports' => [],
        'source' => 'error'
    ]);
}
