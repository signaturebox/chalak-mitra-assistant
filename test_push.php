<?php
/**
 * Test script for Targeted Push Notifications
 * Run this from browser or command line to test if targeting works.
 */
require_once 'api/config/db_config.php';
require_once 'api/notifications/push_notifier.php';

$db = getDBConnection();

// Test 1: Bikaner Division Targeting
echo "Testing Bikaner Division Push...\n";
$result = sendPushToTargetUsers($db, "Targeted Test", "This is for Bikaner Division", 4, null, ['test' => true]);
echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n\n";

// Test 2: Global Push
echo "Testing Global Push...\n";
$result = sendPushToTargetUsers($db, "Global Test", "This is for Everyone", null, null, ['test' => true]);
echo "Result: " . json_encode($result, JSON_PRETTY_PRINT) . "\n";
?>
