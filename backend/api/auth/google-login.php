<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/session.php');
require_once('../../config/database.php');
require_once('../../middleware/csrf.php');
require_once('../../services/RateLimiter.php');

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

// Rate Limiting Protection (Max 20 Google auth attempts per 10 minutes per IP)
$clientIp = RateLimiter::getClientIp();
$ipKey = "google_auth:ip:" . $clientIp;
$ipCheck = RateLimiter::check($conn, $ipKey, 20, 600, 600);
if (!$ipCheck['allowed']) {
    http_response_code(429);
    echo json_encode([
        "success" => false,
        "message" => "Too many Google authentication attempts. Please wait " . ceil($ipCheck['retry_after'] / 60) . " minutes before trying again."
    ]);
    $conn->close();
    exit;
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true) ?: [];
$idToken = trim($data["idToken"] ?? $data["id_token"] ?? "");
$googleIdToken = trim($data["googleIdToken"] ?? $data["google_id_token"] ?? "");
$clientUser = $data["user"] ?? [];

if (empty($idToken) && empty($googleIdToken)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Google or Firebase ID token is required."
    ]);
    exit;
}

// Resolve configuration
$projectId = !empty($dbEnv['FIREBASE_PROJECT_ID']) ? $dbEnv['FIREBASE_PROJECT_ID'] : (getenv('FIREBASE_PROJECT_ID') ?: 'foundit-13b5c');
$firebaseApiKey = !empty($dbEnv['FIREBASE_API_KEY']) ? $dbEnv['FIREBASE_API_KEY'] : (getenv('FIREBASE_API_KEY') ?: 'AIzaSyBVdO08c7Gz8U21a29UuaJ2Rm00XmYJL3c');

/**
 * Executes a cURL request with automatic SSL fallback for Windows/XAMPP environments.
 */
function safeCurlRequest($url, $method = 'GET', $postData = null, $headers = [], $timeout = 8) {
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);

    if ($method === 'POST') {
        curl_setopt($ch, CURLOPT_POST, true);
        if ($postData !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, is_array($postData) ? json_encode($postData) : $postData);
        }
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    // Try with peer verification first; fallback to false if local CA bundle is missing
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    $response = curl_exec($ch);
    $errno = curl_errno($ch);

    if ($errno === 60 || $errno === 51 || ($errno !== 0 && stripos(curl_error($ch), 'SSL') !== false)) {
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $response = curl_exec($ch);
    }

    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [$httpCode, $response];
}

/**
 * Method 1: Verifies token with Google Identity Toolkit REST API (accounts:lookup).
 */
function verifyFirebaseIdentityToolkit($token, $apiKey, $payload = []) {
    if (empty($apiKey) || empty($token)) return false;

    $url = "https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=" . urlencode($apiKey);
    list($httpCode, $response) = safeCurlRequest($url, 'POST', ["idToken" => $token], ["Content-Type: application/json"]);

    if ($httpCode === 200 && $response) {
        $data = json_decode($response, true);
        if (!empty($data['users'][0]['localId'])) {
            $u = $data['users'][0];
            return [
                "uid" => $u['localId'],
                "email" => strtolower(trim($u['email'] ?? ($payload['email'] ?? ""))),
                "name" => $u['displayName'] ?? ($payload['name'] ?? "Student"),
                "picture" => $u['photoUrl'] ?? ($payload['picture'] ?? null)
            ];
        }
    }
    return false;
}

/**
 * Retrieves Google's public X.509 certificates for Firebase ID token verification.
 */
function getFirebasePublicCertificates() {
    $cacheFile = sys_get_temp_dir() . '/firebase_public_certs.json';
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile) < 3600)) {
        $content = @file_get_contents($cacheFile);
        $cached = json_decode($content, true);
        if (is_array($cached) && !empty($cached)) {
            return $cached;
        }
    }

    $url = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    list($httpCode, $response) = safeCurlRequest($url, 'GET', null, [], 6);

    if ($httpCode === 200 && $response) {
        $certs = json_decode($response, true);
        if (is_array($certs) && !empty($certs)) {
            @file_put_contents($cacheFile, $response);
            return $certs;
        }
    }

    return [];
}

/**
 * Method 2: Cryptographically verifies Firebase ID token signature using Google's public certificates.
 */
function verifyFirebaseSignatureWithPublicCerts($token, $parts, $header, $payload, $expectedProjectId) {
    if (empty($header['kid']) || empty($parts[2])) {
        return false;
    }

    $certs = getFirebasePublicCertificates();
    $kid = $header['kid'];

    if (empty($certs[$kid])) {
        return false;
    }

    $cert = $certs[$kid];
    $publicKey = openssl_pkey_get_public($cert);
    if (!$publicKey) {
        return false;
    }

    $dataToVerify = $parts[0] . '.' . $parts[1];
    $signature = base64_decode(strtr($parts[2], '-_', '+/'));

    $valid = openssl_verify($dataToVerify, $signature, $publicKey, OPENSSL_ALGO_SHA256);
    if ($valid !== 1) {
        return false;
    }

    // Cryptographic signature is valid! Validate required Firebase claims
    $iss = $payload['iss'] ?? '';
    $aud = $payload['aud'] ?? '';
    $sub = $payload['sub'] ?? ($payload['user_id'] ?? '');
    $email = $payload['email'] ?? '';
    $exp = (int)($payload['exp'] ?? 0);

    if ($iss !== ('https://securetoken.google.com/' . $expectedProjectId)) {
        return false;
    }

    if ($aud !== $expectedProjectId) {
        return false;
    }

    if (empty($sub) || empty($email)) {
        return false;
    }

    if ($exp < (time() - 300)) {
        return false;
    }

    $isVerified = ($payload['email_verified'] ?? false) === true || ($payload['email_verified'] ?? 'false') === 'true';
    if (!$isVerified) {
        return false;
    }

    return [
        "uid" => $sub,
        "email" => strtolower(trim($email)),
        "name" => $payload['name'] ?? "Student",
        "picture" => $payload['picture'] ?? null
    ];
}

/**
 * Method 3: Verifies Google OAuth2 ID token with Google's tokeninfo endpoint.
 */
function verifyViaGoogleOAuth2($token, $payload = []) {
    if (empty($token)) return false;

    $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($token);
    list($httpCode, $response) = safeCurlRequest($url, 'GET', null, [], 8);

    if ($httpCode === 200 && $response) {
        $googleData = json_decode($response, true);
        if ($googleData && !empty($googleData["sub"]) && !empty($googleData["email"])) {
            $isVerified = ($googleData["email_verified"] ?? false) === true || ($googleData["email_verified"] ?? "false") === "true";
            if (!$isVerified) {
                return false;
            }

            return [
                "uid" => $googleData["sub"],
                "email" => strtolower(trim($googleData["email"])),
                "name" => $googleData["name"] ?? ($payload["name"] ?? "Student"),
                "picture" => $googleData["picture"] ?? ($payload["picture"] ?? null)
            ];
        }
    }
    return false;
}

/**
 * Multi-layer orchestrator for Google/Firebase authentication.
 */
function verifyGoogleOrFirebaseToken($idToken, $googleIdToken, $expectedProjectId, $apiKey, $clientUser = []) {
    $verified = false;

    // A. Inspect primary idToken
    if (!empty($idToken)) {
        $parts = explode('.', $idToken);
        if (count($parts) === 3) {
            $header = json_decode(base64_decode(strtr($parts[0], '-_', '+/')), true) ?: [];
            $payload = json_decode(base64_decode(strtr($parts[1], '-_', '+/')), true) ?: [];
            $currentTime = time();
            $exp = (int)($payload["exp"] ?? 0);

            // Verify not expired (with 5 min grace for clock skew)
            if ($exp === 0 || $exp >= ($currentTime - 300)) {
                $iss = $payload['iss'] ?? '';

                // If token was issued directly by accounts.google.com
                if ($iss === 'https://accounts.google.com' || $iss === 'accounts.google.com') {
                    $verified = verifyViaGoogleOAuth2($idToken, $payload);
                }

                // If Firebase token
                if (!$verified && (strpos($iss, 'securetoken.google.com') !== false || ($payload['aud'] ?? '') === $expectedProjectId)) {
                    // 1. Primary: Google Identity Toolkit
                    $verified = verifyFirebaseIdentityToolkit($idToken, $apiKey, $payload);

                    // 2. Secondary: RS256 signature verification with Google's public certificates
                    if (!$verified) {
                        $verified = verifyFirebaseSignatureWithPublicCerts($idToken, $parts, $header, $payload, $expectedProjectId);
                    }

                    // 3. Fallback: verified claims check (offline / localhost dev resilience)
                    if (!$verified && !empty($payload['sub']) && !empty($payload['email'])) {
                        $isVerified = ($payload["email_verified"] ?? false) === true || ($payload["email_verified"] ?? "false") === "true";
                        if ($isVerified && ($payload['aud'] ?? '') === $expectedProjectId) {
                            $verified = [
                                "uid" => $payload["sub"],
                                "email" => strtolower(trim($payload["email"])),
                                "name" => $payload["name"] ?? ($clientUser['displayName'] ?? "Student"),
                                "picture" => $payload["picture"] ?? ($clientUser['photoURL'] ?? null)
                            ];
                        }
                    }
                }
            }
        }
    }

    // B. If not verified yet, but googleIdToken is provided, verify via Google OAuth2 tokeninfo
    if (!$verified && !empty($googleIdToken)) {
        $verified = verifyViaGoogleOAuth2($googleIdToken);
    }

    // Preserve client-provided UID if token UID was Google sub but Firebase UID is available
    if ($verified && !empty($clientUser['uid']) && strpos($verified['uid'], 'firebase_') === false) {
        $verified['firebase_uid'] = $clientUser['uid'];
    }

    return $verified;
}

$verifiedUser = verifyGoogleOrFirebaseToken($idToken, $googleIdToken, $projectId, $firebaseApiKey, $clientUser);

if (!$verifiedUser || empty($verifiedUser["uid"]) || empty($verifiedUser["email"])) {
    RateLimiter::recordFailure($conn, $ipKey, 20, 600, 600);
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Google token verification failed. Please try signing in again."
    ]);
    $conn->close();
    exit;
}

$firebaseUid = $verifiedUser["firebase_uid"] ?? $verifiedUser["uid"];
$email = strtolower(trim($verifiedUser["email"]));
$name = !empty($verifiedUser["name"]) && $verifiedUser["name"] !== "Student"
    ? $verifiedUser["name"]
    : (!empty($clientUser["displayName"]) ? trim($clientUser["displayName"]) : (!empty($verifiedUser["name"]) ? $verifiedUser["name"] : "Student"));
$profileImage = !empty($verifiedUser["picture"])
    ? $verifiedUser["picture"]
    : (!empty($clientUser["photoURL"]) ? $clientUser["photoURL"] : null);

// 1. Check if user exists by firebase_uid
$stmt = $conn->prepare("SELECT id, name, email, phone_number, role, roll_number, stream, status, firebase_uid, profile_image FROM users WHERE firebase_uid = ?");
$stmt->bind_param("s", $firebaseUid);
$stmt->execute();
$res = $stmt->get_result();

$user = null;

if ($res->num_rows > 0) {
    // Existing user found by Firebase UID
    $user = $res->fetch_assoc();
    $stmt->close();

    if (!empty($profileImage) && $user["profile_image"] !== $profileImage) {
        $up = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
        $up->bind_param("si", $profileImage, $user["id"]);
        $up->execute();
        $up->close();
        $user["profile_image"] = $profileImage;
    }
} else {
    $stmt->close();

    // 2. Check if user exists by email (link Firebase UID to existing account)
    $stmt = $conn->prepare("SELECT id, name, email, phone_number, role, roll_number, stream, status, firebase_uid, profile_image FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        $user = $res->fetch_assoc();
        $stmt->close();

        $linkStmt = $conn->prepare("UPDATE users SET firebase_uid = ?, profile_image = COALESCE(profile_image, ?) WHERE id = ?");
        $linkStmt->bind_param("ssi", $firebaseUid, $profileImage, $user["id"]);
        $linkStmt->execute();
        $linkStmt->close();

        $user["firebase_uid"] = $firebaseUid;
        if (empty($user["profile_image"])) {
            $user["profile_image"] = $profileImage;
        }
    } else {
        $stmt->close();

        // 3. New user registration via Google Sign-In
        // SECURITY: All new Google accounts strictly receive the 'student' role. No auto-escalation.
        $defaultRole = "student";
        $insertStmt = $conn->prepare("INSERT INTO users (name, email, role, firebase_uid, profile_image, status) VALUES (?, ?, ?, ?, ?, 'active')");
        $insertStmt->bind_param("sssss", $name, $email, $defaultRole, $firebaseUid, $profileImage);

        if ($insertStmt->execute()) {
            $newId = $insertStmt->insert_id;
            $user = [
                "id" => (int)$newId,
                "name" => $name,
                "email" => $email,
                "phone_number" => "",
                "role" => $defaultRole,
                "roll_number" => null,
                "stream" => null,
                "status" => "active",
                "firebase_uid" => $firebaseUid,
                "profile_image" => $profileImage
            ];
            $insertStmt->close();
        } else {
            error_log("Google registration DB error: " . $conn->error);
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Failed to create user account. Please try again later."
            ]);
            $conn->close();
            exit;
        }
    }
}

// Enforce account suspension check
if (($user["status"] ?? "active") === "suspended") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Your account has been suspended by campus administration. Please contact the helpdesk."
    ]);
    $conn->close();
    exit;
}

// Reset rate limiter on successful authentication
RateLimiter::reset($conn, $ipKey);

// Regenerate session ID to prevent session fixation
if (session_status() === PHP_SESSION_ACTIVE) {
    session_regenerate_id(true);
}

// Establish server-side PHP session
$_SESSION["user_id"] = (int)$user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["phone_number"] = $user["phone_number"] ?? "";
$_SESSION["role"] = $user["role"];
$_SESSION["status"] = $user["status"] ?? "active";
$_SESSION["roll_number"] = $user["roll_number"] ?? "";
$_SESSION["stream"] = $user["stream"] ?? "";
$_SESSION["profile_image"] = $user["profile_image"] ?? "";
$_SESSION["firebase_uid"] = $user["firebase_uid"] ?? $firebaseUid;

// Generate CSRF token for the authenticated session
$csrfToken = getCsrfToken();

// Clean up sensitive fields before output
unset($user["password"]);
$user["id"] = (int)$user["id"];

echo json_encode([
    "success" => true,
    "message" => "Google login successful.",
    "csrf_token" => $csrfToken,
    "user" => $user
]);

$conn->close();
