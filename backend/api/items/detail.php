<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    http_response_code(400);
    echo json_encode(["success" => false, "message" => "Valid item ID required."]);
    exit;
}

$stmt = $conn->prepare("
    SELECT 
        i.id,
        i.user_id,
        i.type,
        i.title,
        i.description,
        i.category,
        i.location,
        i.item_date as date,
        i.image,
        i.status,
        i.created_at,
        u.name as reporter,
        u.email as reporter_email,
        u.role as reporter_role
    FROM items i
    LEFT JOIN users u ON i.user_id = u.id
    WHERE i.id = ?
");

$stmt->bind_param("i", $id);
$stmt->execute();
$res = $stmt->get_result();
$item = $res->fetch_assoc();
$stmt->close();

if (!$item) {
    http_response_code(404);
    echo json_encode(["success" => false, "message" => "Item report not found."]);
    $conn->close();
    exit;
}

// Fetch active claim count for this item
$claimCount = 0;
$cStmt = $conn->prepare("SELECT COUNT(*) as cnt FROM claims WHERE item_id = ?");
if ($cStmt) {
    $cStmt->bind_param("i", $id);
    $cStmt->execute();
    $cRes = $cStmt->get_result()->fetch_assoc();
    $claimCount = (int)($cRes['cnt'] ?? 0);
    $cStmt->close();
}

// If item is matched, fetch linked item info
$matchedItem = null;
if ($item['status'] === 'matched') {
    if ($item['type'] === 'lost') {
        $mStmt = $conn->prepare("
            SELECT f.id, f.title, f.location, f.item_date, m.overall_score
            FROM matches m
            JOIN items f ON m.found_item_id = f.id
            WHERE m.lost_item_id = ? AND m.status = 'confirmed'
            LIMIT 1
        ");
    } else {
        $mStmt = $conn->prepare("
            SELECT l.id, l.title, l.location, l.item_date, m.overall_score
            FROM matches m
            JOIN items l ON m.lost_item_id = l.id
            WHERE m.found_item_id = ? AND m.status = 'confirmed'
            LIMIT 1
        ");
    }
    if ($mStmt) {
        $mStmt->bind_param("i", $id);
        $mStmt->execute();
        $mRow = $mStmt->get_result()->fetch_assoc();
        if ($mRow) {
            $matchedItem = [
                "id" => (int)$mRow['id'],
                "title" => $mRow['title'],
                "location" => $mRow['location'],
                "date" => $mRow['item_date'],
                "score" => (float)$mRow['overall_score']
            ];
        }
        $mStmt->close();
    }
}

// Check session to determine if the viewer is the reporter
$isReporter = false;
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
if (!empty($_SESSION['user_id']) && (int)$_SESSION['user_id'] === (int)$item['user_id']) {
    $isReporter = true;
}

$itemData = [
    "id" => (int)$item['id'],
    "user_id" => (int)$item['user_id'],
    "type" => $item['type'],
    "title" => $item['title'],
    "description" => $item['description'],
    "category" => $item['category'] ?? "General",
    "location" => $item['location'] ?? "Campus Grounds",
    "date" => $item['date'] ?? date('Y-m-d', strtotime($item['created_at'])),
    "image" => $item['image'],
    "status" => $item['status'],
    "created_at" => $item['created_at'],
    "reporter" => $item['reporter'] ?? "MIT-WPU Student",
    "reporter_role" => $item['reporter_role'] ?? "student",
    "claims_count" => $claimCount,
    "matched_item" => $matchedItem,
    "is_reporter" => $isReporter,
    "custody_desk" => ($item['type'] === 'found') ? "Main Campus Security Desk (Building A, Ground Floor)" : null
];

echo json_encode([
    "success" => true,
    "item" => $itemData
]);

$conn->close();
?>
