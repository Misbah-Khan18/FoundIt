<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

$authenticatedUser = requireAuth($conn);
$user_id = (int)$authenticatedUser["id"];

$data = json_decode(file_get_contents("php://input"), true);
validateCsrfToken($data);

$id = isset($data["id"]) ? (int)$data["id"] : null;
$deleteAll = !empty($data["all"]);

if ($deleteAll) {
    $stmt = $conn->prepare("DELETE FROM notifications WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "All notifications deleted.",
        "affected" => $affected
    ]);
    $conn->close();
    exit;
}

if ($id && $id > 0) {
    $stmt = $conn->prepare("DELETE FROM notifications WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    $stmt->execute();
    $affected = $stmt->affected_rows;
    $stmt->close();

    if ($affected > 0) {
        echo json_encode([
            "success" => true,
            "message" => "Notification deleted."
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
