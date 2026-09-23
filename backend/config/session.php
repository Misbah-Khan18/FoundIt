<?php

/**
 * FoundIt - Centralized Secure Session & HTTP Security Headers Configuration
 */

// 1. Send defensive HTTP security headers
if (!headers_sent()) {
    header("X-Content-Type-Options: nosniff");
    header("X-Frame-Options: SAMEORIGIN");
    header("Referrer-Policy: strict-origin-when-cross-origin");
    header("X-XSS-Protection: 1; mode=block");
}

// 2. Initialize session with hardened cookie parameters if not already active
if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (
        (!empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off') ||
        (isset($_SERVER['SERVER_PORT']) && $_SERVER['SERVER_PORT'] == 443) ||
        (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && strtolower($_SERVER['HTTP_X_FORWARDED_PROTO']) === 'https')
    );

    // Secure cookie parameters
    session_set_cookie_params([
        'lifetime' => 0,          // Expire when browser closes
        'path'     => '/',
        'domain'   => '',         // Host-only cookie
        'secure'   => $isHttps,   // Secure on HTTPS, permits local HTTP in XAMPP
        'httponly' => true,       // Inaccessible to JavaScript (mitigates XSS cookie theft)
        'samesite' => 'Lax'       // Defends against cross-site request forgery
    ]);

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');

    session_start();
}
