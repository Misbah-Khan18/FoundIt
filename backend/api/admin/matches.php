<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/MatchingEngine.php');
require_once('../../services/NotificationService.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

$method = $_SERVER['REQUEST_METHOD'];

// Handle POST: Update Match Status (confirmed, rejected, reviewed)
if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    validateCsrfToken($input);
    
    $matchId = $input['match_id'] ?? $input['id'] ?? null;
    $status  = trim($input['status'] ?? '');
    
    $allowedStatuses = ['pending', 'reviewed', 'confirmed', 'rejected'];
    if (!$matchId || !in_array($status, $allowedStatuses)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid parameters. Require match_id and valid status (pending, reviewed, confirmed, rejected)."
        ]);
        exit;
    }

    // Extract numeric db_id or lost/found ids if string format "m-{lost}-{found}"
    $dbId = null;
    $lostId = null;
    $foundId = null;

    if (is_numeric($matchId)) {
        $dbId = (int)$matchId;
    } elseif (is_string($matchId) && strpos($matchId, 'm-') === 0) {
        $parts = explode('-', $matchId);
        if (count($parts) === 3) {
            $lostId  = (int)$parts[1];
            $foundId = (int)$parts[2];
        }
    }

    if ($dbId) {
        $stmt = $conn->prepare("UPDATE matches SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $status, $dbId);
        $stmt->execute();
        $stmt->close();
    } elseif ($lostId && $foundId) {
        $stmt = $conn->prepare("UPDATE matches SET status = ? WHERE lost_item_id = ? AND found_item_id = ?");
        $stmt->bind_param("sii", $status, $lostId, $foundId);
        $stmt->execute();
        $stmt->close();
    } else {
        http_response_code(404);
        echo json_encode(["success" => false, "message" => "Match record not found."]);
        exit;
    }

    // If confirmed, update lost & found item statuses to 'matched' in items table
    if ($status === 'confirmed') {
        if (!$lostId || !$foundId) {
            if ($dbId) {
                $mStmt = $conn->prepare("SELECT lost_item_id, found_item_id FROM matches WHERE id = ?");
                $mStmt->bind_param("i", $dbId);
                $mStmt->execute();
                $mRes = $mStmt->get_result()->fetch_assoc();
                if ($mRes) {
                    $lostId = (int)$mRes['lost_item_id'];
                    $foundId = (int)$mRes['found_item_id'];
                }
                $mStmt->close();
            }
        }

        if ($lostId && $foundId) {
            $itemStmt = $conn->prepare("UPDATE items SET status = 'matched' WHERE id IN (?, ?)");
            $itemStmt->bind_param("ii", $lostId, $foundId);
            $itemStmt->execute();
            $itemStmt->close();

            // Fetch details for lost & found items to notify lost item reporter
            $infoStmt = $conn->prepare("
                SELECT l.user_id as lost_user_id, l.title as lost_title, l.location as lost_location, l.item_date as lost_date,
                       f.title as found_title
                FROM items l, items f
                WHERE l.id = ? AND f.id = ?
            ");
            $infoStmt->bind_param("ii", $lostId, $foundId);
            $infoStmt->execute();
            $infoRes = $infoStmt->get_result()->fetch_assoc();
            $infoStmt->close();

            if ($infoRes) {
                $lostUserId = (int)$infoRes['lost_user_id'];
                $lostTitle = $infoRes['lost_title'];
                $foundTitle = $infoRes['found_title'];
                $location = $infoRes['lost_location'] ?? 'Campus';
                $date = $infoRes['lost_date'] ?? date('Y-m-d');

                NotificationService::create(
                    $conn,
                    $lostUserId,
                    "Smart Match Confirmed for " . $lostTitle,
                    "An admin has confirmed a match candidate for your reported lost item (" . $lostTitle . ") with found item (" . $foundTitle . ").",
                    "match_confirmed",
                    $lostId,
                    null,
                    true,
                    [
                        'lostItemTitle' => $lostTitle,
                        'foundItemTitle' => $foundTitle,
                        'location' => $location,
                        'date' => $date
                    ]
                );
            }
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Match status successfully updated to '{$status}'."
    ]);
    $conn->close();
    exit;
}

// Handle GET: Run engine & fetch stored matches from MySQL matches table
if ($method === 'GET') {
    // Run engine to ensure all active items are evaluated and synchronized
    try {
        MatchingEngine::runAll($conn);
    } catch (\Throwable $e) {
        error_log("MatchingEngine runAll error: " . $e->getMessage());
    }

    $query = "
        SELECT 
            m.id as db_id,
            m.lost_item_id,
            m.found_item_id,
            m.description_score,
            m.image_score,
            m.location_score,
            m.date_score,
            m.overall_score,
            m.confidence_level,
            m.status as match_status,
            m.created_at as match_created_at,
            l.title as lost_title,
            l.description as lost_description,
            l.category as lost_category,
            l.location as lost_location,
            l.item_date as lost_date,
            l.image as lost_image,
            l.status as lost_status,
            l.created_at as lost_created_at,
            lu.name as lost_reporter,
            lu.email as lost_reporter_email,
            f.title as found_title,
            f.description as found_description,
            f.category as found_category,
            f.location as found_location,
            f.item_date as found_date,
            f.image as found_image,
            f.status as found_status,
            f.created_at as found_created_at,
            fu.name as found_reporter,
            fu.email as found_reporter_email
        FROM matches m
        JOIN items l ON m.lost_item_id = l.id
        JOIN items f ON m.found_item_id = f.id
        LEFT JOIN users lu ON l.user_id = lu.id
        LEFT JOIN users fu ON f.user_id = fu.id
        WHERE m.overall_score >= 35.0 AND l.status != 'resolved' AND f.status != 'resolved'
        ORDER BY m.overall_score DESC
    ";

    $result = $conn->query($query);
    $matches = [];

    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $descScore = (float)$row['description_score'];
            $imgScore  = (float)$row['image_score'];
            $locScore  = (float)$row['location_score'];
            $dateScore = (float)$row['date_score'];
            $overall   = (float)$row['overall_score'];

            $matchFactors = [];
            if (!empty($row['lost_category']) && !empty($row['found_category']) && strtolower($row['lost_category']) === strtolower($row['found_category'])) {
                $matchFactors[] = ["label" => "Identical Category (" . $row['lost_category'] . ")", "matched" => true];
            }
            if ($descScore >= 50) {
                $matchFactors[] = ["label" => "High Text & Keyword Similarity ({$descScore}%)", "matched" => true];
            }
            if ($imgScore >= 50) {
                $matchFactors[] = ["label" => "Visual Feature Match ({$imgScore}%)", "matched" => true];
            }
            if ($locScore >= 50) {
                $matchFactors[] = ["label" => "Location Proximity Match ({$locScore}%)", "matched" => true];
            }
            if ($dateScore >= 60) {
                $matchFactors[] = ["label" => "Temporal Proximity ({$dateScore}%)", "matched" => true];
            }
            if (empty($matchFactors)) {
                $matchFactors[] = ["label" => "General Attribute & Keyword Alignment ({$overall}%)", "matched" => true];
            }

            $matches[] = [
                "id" => "m-" . $row['lost_item_id'] . "-" . $row['found_item_id'],
                "db_id" => (int)$row['db_id'],
                "matchScore" => (int)round($overall),
                "overallScore" => $overall,
                "descriptionScore" => $descScore,
                "imageScore" => $imgScore,
                "locationScore" => $locScore,
                "dateScore" => $dateScore,
                "confidenceLevel" => $row['confidence_level'],
                "status" => $row['match_status'],
                "lostItem" => [
                    "id" => (int)$row['lost_item_id'],
                    "title" => $row['lost_title'],
                    "category" => $row['lost_category'] ?? "General",
                    "location" => $row['lost_location'] ?? "Campus",
                    "date" => $row['lost_date'] ?? date("Y-m-d", strtotime($row['lost_created_at'])),
                    "reporter" => $row['lost_reporter'] ?? "Student",
                    "reporter_email" => $row['lost_reporter_email'] ?? "",
                    "description" => $row['lost_description'] ?? "",
                    "image" => $row['lost_image'] ?? null,
                    "status" => $row['lost_status']
                ],
                "foundItem" => [
                    "id" => (int)$row['found_item_id'],
                    "title" => $row['found_title'],
                    "category" => $row['found_category'] ?? "General",
                    "location" => $row['found_location'] ?? "Campus",
                    "date" => $row['found_date'] ?? date("Y-m-d", strtotime($row['found_created_at'])),
                    "reporter" => $row['found_reporter'] ?? "Student",
                    "reporter_email" => $row['found_reporter_email'] ?? "",
                    "description" => $row['found_description'] ?? "",
                    "image" => $row['found_image'] ?? null,
                    "status" => $row['found_status']
                ],
                "matchFactors" => $matchFactors
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "matches" => $matches
    ]);
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method Not Allowed"]);
$conn->close();
?>
