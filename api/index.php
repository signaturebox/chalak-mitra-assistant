<?php
/**
 * NWR Chalak Mitra API Index
 * Provides API endpoints information
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$api_info = [
    'name' => 'NWR Chalak Mitra API',
    'version' => '1.0.0',
    'description' => 'API for North Western Railway Chalak Mitra application',
    'endpoints' => [
        'auth' => [
            'POST /auth/login' => 'User login',
            'POST /auth/register' => 'User registration'
        ],
        'users' => [
            'GET /users/profile?id=X' => 'Get user profile',
            'PUT /users/profile' => 'Update user profile'
        ],
        'search' => [
            'GET /search/fault_search?q=QUERY&type=TYPE' => 'Search faults',
            'POST /search/fault_search' => 'Add new fault (admin only)'
        ],
        'quiz' => [
            'GET /quiz/get_questions?category=CAT&limit=LIMIT' => 'Get quiz questions',
            'POST /quiz/submit_quiz' => 'Submit quiz answers',
            'GET /quiz/get_history?user_id=ID' => 'Get quiz history'
        ],
        'files' => [
            'GET /files/get_files' => 'Get files list',
            'POST /files/file_upload' => 'Upload file'
        ],
        'notifications' => [
            'GET /notifications/get_notifications' => 'Get user notifications'
        ],
        'system' => [
            'GET /system/get_settings' => 'Get system settings'
        ]
    ],
    'documentation' => 'Refer to the API documentation for detailed usage',
    'status' => 'operational'
];

echo json_encode($api_info, JSON_PRETTY_PRINT);
?>