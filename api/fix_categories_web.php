<?php
/**
 * Web-based Fix Categories Script
 */
require_once 'config/db_config.php';

header('Content-Type: text/plain');

try {
    // Reuse the working connection from db_config
    $db = getDBConnection();
    echo "Connected to database successfully.\n\n";
    
    // 1. Fix specific files
    echo "--- Applying Fixes ---\n";
    
    $updates = [
        'wag12' => ['test12', 'wag12', 'WAG-12', 'wag 12', 'Pocket Book', 'TSD WAG-12'],
        'threePhase' => ['3-Phase', '3 phase', 'wap7', 'wag9', 'TSD'],
        'conventional' => ['conventional', 'wap4', 'wag7']
    ];
    
    $totalUpdated = 0;
    
    foreach ($updates as $cat => $keywords) {
        foreach ($keywords as $kw) {
            $sql = "UPDATE files SET category = ? WHERE (title LIKE ? OR name LIKE ? OR original_name LIKE ?) AND (category IS NULL OR category = '') AND section LIKE 'Electric%'";
            $stmt = $db->prepare($sql);
            $term = "%$kw%";
            $stmt->execute([$cat, $term, $term, $term]);
            if ($stmt->rowCount() > 0) {
                echo "Updated {$stmt->rowCount()} files to category '$cat' (matched '$kw')\n";
                $totalUpdated += $stmt->rowCount();
            }
        }
    }
    
    // 2. Auto-assign remaining files from today
    $today = date('Y-m-d');
    echo "\nAuto-assigning remaining files from today ($today) to 'wag12'...\n";
    $stmt = $db->prepare("UPDATE files SET category = 'wag12' WHERE section LIKE 'Electric%' AND (category IS NULL OR category = '') AND uploaded_at LIKE ?");
    $stmt->execute(["$today%"]);
    $autoAssigned = $stmt->rowCount();
    echo "Auto-assigned $autoAssigned files.\n";
    
    $totalUpdated += $autoAssigned;
    
    echo "\nTotal files fixed: $totalUpdated\n";
    echo "You can now refresh the Electric Locomotives page.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
