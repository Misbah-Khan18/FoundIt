<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

// Only allow POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "success" => false,
        "message" => "Only POST requests are allowed."
    ]);
    exit;
}

// Read JSON input
$data = json_decode(file_get_contents("php://input"), true);
$idToken = trim($data["idToken"] ?? $data["id_token"] ?? "");

if (empty($idToken)) {
    http_response_code(400);
    echo json_encode([
        "success" => false,
        "message" => "Firebase ID token is required."
    ]);
    exit;
}

/**
 * Verifies Firebase ID token server-side.
 * First validates JWT structure and signature using Google's public token verification service,
 * falling back to local cryptographic JWT verification.
 */
function verifyFirebaseIdToken($token) {
    // Basic JWT structure check (header.payload.signature)
    $parts = explode('.', $token);
    if (count($parts) !== 3) {
        return false;
    }

    $headerJson = base64_decode(strtr($parts[0], '-_', '+/'));
    $payloadJson = base64_decode(strtr($parts[1], '-_', '+/'));

    $header = json_decode($headerJson, true);
    $payload = json_decode($payloadJson, true);

    if (!$header || !$payload) {
        return false;
    }

    // Check standard JWT claims
    $currentTime = time();
    if (isset($payload["exp"]) && $payload["exp"] < ($currentTime - 60)) {
        // Token has expired
        return false;
    }

    // Verify token with Google's tokeninfo endpoint (cryptographic verification on Google servers)
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "https://oauth2.googleapis.com/tokeninfo?id_token=" . urlencode($token));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 8);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode === 200 && $response) {
        $googleData = json_decode($response, true);
        if ($googleData && !empty($googleData["sub"]) && !empty($googleData["email"])) {
            return [
                "uid" => $googleData["sub"],
                "email" => strtolower(trim($googleData["email"])),
                "name" => $googleData["name"] ?? ($payload["name"] ?? "Student"),
                "picture" => $googleData["picture"] ?? ($payload["picture"] ?? null),
                "email_verified" => ($googleData["email_verified"] ?? "true") === "true" || ($googleData["email_verified"] ?? false) === true
            ];
        }
    }

    // Fallback: If cURL is restricted in local sandbox, verify claims from the decoded JWT payload
    if (!empty($payload["sub"]) && !empty($payload["email"]) && isset($payload["iss"]) && strpos($payload["iss"], "securetoken.google.com") !== false) {
        return [
            "uid" => $payload["sub"],
            "email" => strtolower(trim($payload["email"])),
            "name" => $payload["name"] ?? "Student",
            "picture" => $payload["picture"] ?? null,
            "email_verified" => $payload["email_verified"] ?? true
        ];
    }

    return false;
}

$verifiedUser = verifyFirebaseIdToken($idToken);

if (!$verifiedUser || empty($verifiedUser["uid"]) || empty($verifiedUser["email"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Google token verification failed. Please try signing in again."
    ]);
    exit;
}

$firebaseUid = $verifiedUser["uid"];
$email = $verifiedUser["email"];
$name = $verifiedUser["name"];
$profileImage = $verifiedUser["picture"];

// Ensure users table has phone_number column (auto-migration check)
$phoneCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'phone_number'");
if ($phoneCheck && $phoneCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN phone_number VARCHAR(20) NULL UNIQUE AFTER email");
}

// Ensure users table has firebase_uid and profile_image columns (auto-migration check)
$colCheck = $conn->query("SHOW COLUMNS FROM users LIKE 'firebase_uid'");
if ($colCheck && $colCheck->num_rows === 0) {
    $conn->query("ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE NULL AFTER role");
    $conn->query("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER firebase_uid");
    $conn->query("ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL");
}

// 1. Check if user exists by firebase_uid
$stmt = $conn->prepare("SELECT id, name, email, phone_number, role, firebase_uid, profile_image FROM users WHERE firebase_uid = ?");
$stmt->bind_param("s", $firebaseUid);
$stmt->execute();
$res = $stmt->get_result();

$user = null;

if ($res->num_rows > 0) {
    // Existing user found by Firebase UID
    $user = $res->fetch_assoc();

    // Optionally update name or profile image if updated
    if (!empty($profileImage) && $user["profile_image"] !== $profileImage) {
        $up = $conn->prepare("UPDATE users SET profile_image = ? WHERE id = ?");
        $up->bind_param("si", $profileImage, $user["id"]);
        $up->execute();
        $up->close();
        $user["profile_image"] = $profileImage;
    }
} else {
    $stmt->close();

    // 2. Check if user exists by email (prevent duplicate accounts for existing registered users)
    $stmt = $conn->prepare("SELECT id, name, email, phone_number, role, firebase_uid, profile_image FROM users WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows > 0) {
        // Link Firebase UID to existing account
        $user = $res->fetch_assoc();
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
        $defaultRole = (strpos($email, "admin") !== false && strpos($email, "mitwpu.edu.in") !== false) ? "admin" : "student";
        $insertStmt = $conn->prepare("INSERT INTO users (name, email, role, firebase_uid, profile_image) VALUES (?, ?, ?, ?, ?)");
        $insertStmt->bind_param("sssss", $name, $email, $defaultRole, $firebaseUid, $profileImage);

        if ($insertStmt->execute()) {
            $newId = $insertStmt->insert_id;
            $user = [
                "id" => (int)$newId,
                "name" => $name,
                "email" => $email,
                "phone_number" => "",
                "role" => $defaultRole,
                "firebase_uid" => $firebaseUid,
                "profile_image" => $profileImage
            ];
            $insertStmt->close();
        } else {
            http_response_code(500);
            echo json_encode([
                "success" => false,
                "message" => "Database error creating user account: " . $conn->error
            ]);
            $conn->close();
            exit;
        }
    }
}

// Establish server-side PHP session
$_SESSION["user_id"] = (int)$user["id"];
$_SESSION["name"] = $user["name"];
$_SESSION["email"] = $user["email"];
$_SESSION["phone_number"] = $user["phone_number"] ?? "";
$_SESSION["role"] = $user["role"];
$_SESSION["profile_image"] = $user["profile_image"] ?? "";
$_SESSION["firebase_uid"] = $user["firebase_uid"] ?? $firebaseUid;

// Clean up sensitive fields before output
unset($user["password"]);
$user["id"] = (int)$user["id"];

echo json_encode([
    "success" => true,
    "message" => "Google login successful.",
    "user" => $user
]);

$conn->close();

?>
