<?php

/**
 * FoundIt - Server-Side Authentication & Authorization Middleware
 */

/**
 * Enforces that the client has an active, authenticated, non-suspended session.
 * 
 * @param mysqli $conn
 * @return array Authenticated user record from database
 */
function requireAuth($conn) {
    if (!isset($_SESSION["user_id"])) {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized: Authentication required."
        ]);
        exit;
    }

    $userId = (int)$_SESSION["user_id"];
    $stmt = $conn->prepare("SELECT id, name, email, phone_number, role, roll_number, stream, status FROM users WHERE id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        $stmt->close();
        session_unset();
        session_destroy();
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Unauthorized: User account no longer exists."
        ]);
        exit;
    }

    $user = $res->fetch_assoc();
    $stmt->close();

    if (($user["status"] ?? "active") === "suspended") {
        session_unset();
        session_destroy();
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Your account has been suspended by campus administration. Please contact the helpdesk."
        ]);
        exit;
    }

    // Keep session attributes synchronized with database
    $_SESSION["role"] = $user["role"];
    $_SESSION["status"] = $user["status"];

    return $user;
}

/**
 * Enforces that the client has an active session AND possesses verified administrator privileges in MySQL.
 * 
 * @param mysqli $conn
 * @return int Verified Administrator User ID
 */
function requireAdmin($conn) {
    $user = requireAuth($conn);

    if (($user["role"] ?? "") !== "admin") {
        http_response_code(403);
        echo json_encode([
            "success" => false,
            "message" => "Forbidden: Administrator privileges required."
        ]);
        exit;
    }

    return (int)$user["id"];
}
