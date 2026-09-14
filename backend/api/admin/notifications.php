<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');

// Strict server-side role check
if (!isset($_SESSION["user_id"]) || ($_SESSION["role"] ?? "") !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Forbidden: Administrator privileges required."
    ]);
    exit;
}

$notifications = [];

// 1. Pending report approvals needing action
$penRes = $conn->query("SELECT id, title, type, created_at FROM items WHERE status IN ('under_review', 'pending') ORDER BY created_at DESC LIMIT 10");
if ($penRes) {
    while ($r = $penRes->fetch_assoc()) {
        $notifications[] = [
            "id" => "notif-item-" . $r["id"],
            "title" => "New " . ucfirst($r["type"]) . " Report Pending",
            "body" => "Report #" . $r["id"] . " (" . $r["title"] . ") requires administrative review.",
            "time" => date("M d, H:i", strtotime($r["created_at"])),
            "is_read" => false,
            "type" => "approval"
        ];
    }
}

// 2. Pending claims needing verification
$claimRes = $conn->query("SELECT c.id, c.created_at, i.title, u.name as claimant FROM claims c JOIN items i ON c.item_id = i.id JOIN users u ON c.claimant_id = u.id WHERE c.status = 'pending' ORDER BY c.created_at DESC LIMIT 10");
if ($claimRes) {
    while ($c = $claimRes->fetch_assoc()) {
        $notifications[] = [
            "id" => "notif-claim-" . $c["id"],
            "title" => "Verification Claim Submitted",
            "body" => $c["claimant"] . " submitted ownership proof for " . $c["title"] . ".",
            "time" => date("M d, H:i", strtotime($c["created_at"])),
            "is_read" => false,
            "type" => "claim"
        ];
    }
}

echo json_encode([
    "success" => true,
    "notifications" => $notifications,
    "unread_count" => count($notifications)
]);

$conn->close();

?>
