<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Authentication required."
    ]);
    exit;
}

$user_id = (int)$_SESSION["user_id"];
$data = json_decode(file_get_contents("php://input"), true);

$id = isset($data["id"]) ? (int)$data["id"] : null;
$markAll = !empty($data["all"]);

if ($markAll) {
    $stmt = $conn->prepare("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "All notifications marked as read.",
        "affected" => $affected
    ]);
    $conn->close();
    exit;
}

if ($id && $id > 0) {
    $stmt = $conn->prepare("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Notification marked as read."
        ]);
    } else {
        http_response_code(404);
        echo json_encode([
            "success" => false,
            "message" => "Notification not found or access denied."
        ]);
    }
    $conn->close();
    exit;
}

http_response_code(400);
echo json_encode([
    "success" => false,
    "message" => "Invalid parameter. Expected 'id' or 'all: true'."
]);
$conn->close();

?>
