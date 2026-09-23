<?php

/**
 * FoundIt - Cross-Site Request Forgery (CSRF) Protection Middleware
 */

/**
 * Returns the current session's CSRF token, generating one if not present.
 * 
 * @return string 64-character hexadecimal CSRF token
 */
function getCsrfToken() {
    if (session_status() === PHP_SESSION_NONE) {
        require_once __DIR__ . '/../config/session.php';
    }

    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

/**
 * Validates the CSRF token on state-changing requests (POST, PUT, DELETE, PATCH).
 * 
 * @param array|null $parsedData Optional already decoded JSON request body array
 * @return bool True if valid; otherwise emits 403 JSON error and terminates execution
 */
function validateCsrfToken($parsedData = null) {
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    // Safe idempotent methods do not mutate state
    if (in_array($method, ['GET', 'HEAD', 'OPTIONS'], true)) {
        return true;
    }

    if (session_status() === PHP_SESSION_NONE) {
        require_once __DIR__ . '/../config/session.php';
    }

    $sessionToken = $_SESSION['csrf_token'] ?? '';
    if (empty($sessionToken)) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "CSRF validation failed: No session security token established."
        ]);
        exit;
    }

    // 1. Check HTTP Header (standard modern SPA pattern)
    $headerToken = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';

    // 2. Check standard Form POST parameter
    $postToken = $_POST['csrf_token'] ?? '';

    // 3. Check JSON payload parameter
    $bodyToken = '';
    if (is_array($parsedData) && !empty($parsedData['csrf_token'])) {
        $bodyToken = $parsedData['csrf_token'];
    }

    $providedToken = !empty($headerToken) ? $headerToken : (!empty($postToken) ? $postToken : $bodyToken);

    if (empty($providedToken) || !hash_equals($sessionToken, $providedToken)) {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "CSRF validation failed: Invalid or missing security token."
        ]);
        exit;
    }

    return true;
}
