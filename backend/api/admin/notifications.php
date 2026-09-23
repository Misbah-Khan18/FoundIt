<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

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

// 3. Activity notifications for the administrator from notifications table
$adminId = (int)$_SESSION["user_id"];
$dbNotifs = $conn->prepare("SELECT id, title, message, type, is_read, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 15");
if ($dbNotifs) {
    $dbNotifs->bind_param("i", $adminId);
    $dbNotifs->execute();
    $dbRes = $dbNotifs->get_result();
    while ($dn = $dbRes->fetch_assoc()) {
        $notifications[] = [
            "id" => "db-notif-" . $dn["id"],
            "title" => $dn["title"],
            "body" => $dn["message"],
            "time" => date("M d, H:i", strtotime($dn["created_at"])),
            "is_read" => (bool)$dn["is_read"],
            "type" => $dn["type"] ?? "general"
        ];
    }
    $dbNotifs->close();
}

echo json_encode([
    "success" => true,
    "notifications" => $notifications,
    "unread_count" => count($notifications)
]);

$conn->close();

?>
