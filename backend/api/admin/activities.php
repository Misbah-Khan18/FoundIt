<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

$activities = [];

// 1. Recent Items created / updated
$itemRes = $conn->query(
    "SELECT i.id, i.title, i.type, i.status, i.created_at, i.updated_at, u.name as user
     FROM items i
     JOIN users u ON i.user_id = u.id
     ORDER BY i.created_at DESC
     LIMIT 15"
);

if ($itemRes) {
    while ($row = $itemRes->fetch_assoc()) {
        $action = $row["type"] === "lost" ? "submitted a lost item report" : "logged a found item";
        if ($row["status"] === "resolved") {
            $action = "marked item as returned & resolved";
        } elseif ($row["status"] === "matched") {
            $action = "potential smart match detected";
        } elseif ($row["status"] === "active") {
            $action = "report is approved and public";
        }

        $timeDiff = time() - strtotime($row["created_at"]);
        $timeStr = "Just now";
        if ($timeDiff > 86400) {
            $timeStr = floor($timeDiff / 86400) . "d ago";
        } elseif ($timeDiff > 3600) {
            $timeStr = floor($timeDiff / 3600) . "h ago";
        } elseif ($timeDiff > 60) {
            $timeStr = floor($timeDiff / 60) . "m ago";
        }

        $activities[] = [
            "id" => "item-" . $row["id"],
            "user" => $row["user"],
            "action" => $action,
            "item" => $row["title"],
            "time" => $timeStr,
            "type" => $row["type"] === "lost" ? "report" : "found",
            "status" => $row["status"],
            "timestamp" => strtotime($row["created_at"])
        ];
    }
}

// 2. Recent Claims submitted
$claimRes = $conn->query(
    "SELECT c.id, c.status, c.created_at, u.name as user, i.title as item
     FROM claims c
     JOIN users u ON c.claimant_id = u.id
     JOIN items i ON c.item_id = i.id
     ORDER BY c.created_at DESC
     LIMIT 10"
);

if ($claimRes) {
    while ($row = $claimRes->fetch_assoc()) {
        $action = "submitted a verification claim";
        if ($row["status"] === "approved") {
            $action = "claim verified and approved";
        } elseif ($row["status"] === "rejected") {
            $action = "claim verification rejected";
        }

        $timeDiff = time() - strtotime($row["created_at"]);
        $timeStr = "Just now";
        if ($timeDiff > 86400) {
            $timeStr = floor($timeDiff / 86400) . "d ago";
        } elseif ($timeDiff > 3600) {
            $timeStr = floor($timeDiff / 3600) . "h ago";
        } elseif ($timeDiff > 60) {
            $timeStr = floor($timeDiff / 60) . "m ago";
        }

        $activities[] = [
            "id" => "claim-" . $row["id"],
            "user" => $row["user"],
            "action" => $action,
            "item" => $row["item"],
            "time" => $timeStr,
            "type" => "claim",
            "status" => $row["status"],
            "timestamp" => strtotime($row["created_at"])
        ];
    }
}

// Sort all combined activities by timestamp descending
usort($activities, function($a, $b) {
    return $b["timestamp"] - $a["timestamp"];
});

echo json_encode([
    "success" => true,
    "activities" => array_slice($activities, 0, 20)
]);

$conn->close();

?>
