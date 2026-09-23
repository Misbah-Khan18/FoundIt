<?php

/**
 * FoundIt - Strict CORS & Origin Verification
 */

require_once __DIR__ . '/session.php';

// 1. Define allowed origins (development & local environments)
$allowedOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://localhost',
    'http://127.0.0.1'
];

// Check if custom origins are specified in environment
$customOrigins = getenv('CORS_ALLOWED_ORIGINS');
if (!empty($customOrigins)) {
    $parts = explode(',', $customOrigins);
    foreach ($parts as $part) {
        $p = trim($part);
        if (!empty($p) && !in_array($p, $allowedOrigins, true)) {
            $allowedOrigins[] = $p;
        }
    }
}

// 2. Validate request origin against allowlist
$origin = $_SERVER["HTTP_ORIGIN"] ?? "";

if (!empty($origin) && in_array(rtrim($origin, '/'), array_map(function($o) { return rtrim($o, '/'); }, $allowedOrigins), true)) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400"); // Cache preflight for 24 hours
}

// Allowed HTTP methods and headers (including X-CSRF-Token)
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token");

// 3. Handle OPTIONS preflight requests
if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}
