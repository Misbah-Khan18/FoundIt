<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../middleware/auth.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

// Platform statistics query
$userCount = 0;
$totalItems = 0;
$lostCount = 0;
$foundCount = 0;
$activeCount = 0;
$resolvedCount = 0;
$totalClaims = 0;

// Users count
$uRes = $conn->query("SELECT COUNT(*) as count FROM users");
if ($uRes) {
    $userCount = (int)$uRes->fetch_assoc()["count"];
}

// Items counts
$iRes = $conn->query("SELECT 
    COUNT(*) as total,
    SUM(CASE WHEN type = 'lost' THEN 1 ELSE 0 END) as lost,
    SUM(CASE WHEN type = 'found' THEN 1 ELSE 0 END) as found,
    SUM(CASE WHEN status IN ('active', 'under_review', 'matched') THEN 1 ELSE 0 END) as active,
    SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
    FROM items");

if ($iRes) {
    $row = $iRes->fetch_assoc();
    $totalItems = (int)($row["total"] ?? 0);
    $lostCount = (int)($row["lost"] ?? 0);
    $foundCount = (int)($row["found"] ?? 0);
    $activeCount = (int)($row["active"] ?? 0);
    $resolvedCount = (int)($row["resolved"] ?? 0);
}

// Claims count
$cRes = $conn->query("SELECT COUNT(*) as count FROM claims");
if ($cRes) {
    $totalClaims = (int)$cRes->fetch_assoc()["count"];
}

// Recent platform reports
$recentReports = [];
$repRes = $conn->query(
    "SELECT i.id, i.type, i.title, i.category, i.location, i.status, i.created_at, u.name as reporter
     FROM items i
     JOIN users u ON i.user_id = u.id
     ORDER BY i.created_at DESC
     LIMIT 10"
);

if ($repRes) {
    while ($r = $repRes->fetch_assoc()) {
        $recentReports[] = $r;
    }
}

echo json_encode([
    "success" => true,
    "stats" => [
        "total_users" => $userCount,
        "total_reports" => $totalItems,
        "lost_reports" => $lostCount,
        "found_reports" => $foundCount,
        "active_cases" => $activeCount,
        "resolved_cases" => $resolvedCount,
        "total_claims" => $totalClaims,
    ],
    "recent_reports" => $recentReports
]);

$conn->close();

?>
