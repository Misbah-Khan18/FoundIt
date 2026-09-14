<?php

require_once('../../config/cors.php');
session_start();
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/NotificationService.php');

// 1. Strict Server-Side Session & Role Authorization Check
if (!isset($_SESSION["user_id"])) {
    http_response_code(401);
    echo json_encode([
        "success" => false,
        "message" => "Unauthorized: Authentication required."
    ]);
    exit;
}

if (($_SESSION["role"] ?? "") !== "admin") {
    http_response_code(403);
    echo json_encode([
        "success" => false,
        "message" => "Forbidden: Administrator privileges required."
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// GET: Fetch all claims with complete item and claimant details
if ($method === "GET") {
    $sql = "SELECT c.id, c.item_id, c.claimant_id, c.message, c.status as claim_status, c.created_at as claim_created_at,
                   i.title as item_title, i.description as item_description, i.type as item_type, 
                   i.category as item_category, i.location as item_location, i.item_date as date, 
                   i.image as item_image, i.status as item_status,
                   u.name as claimant_name, u.email as claimant_email, u.phone_number as claimant_phone,
                   rep.name as reporter_name, rep.email as reporter_email
            FROM claims c
            JOIN items i ON c.item_id = i.id
            JOIN users u ON c.claimant_id = u.id
            LEFT JOIN users rep ON i.user_id = rep.id
            ORDER BY c.created_at DESC";

    $result = $conn->query($sql);
    $claims = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $claims[] = [
                "id" => (int)$row["id"],
                "itemId" => (int)$row["item_id"],
                "itemTitle" => $row["item_title"],
                "itemDescription" => $row["item_description"] ?? "",
                "itemType" => $row["item_type"],
                "category" => $row["item_category"] ?? "General",
                "location" => $row["item_location"] ?? "Campus",
                "itemImage" => $row["item_image"] ?? null,
                "itemStatus" => $row["item_status"],
                "claimantName" => $row["claimant_name"],
                "claimantEmail" => $row["claimant_email"],
                "claimantPhone" => $row["claimant_phone"] ?? "+91 98765 43210",
                "reporterName" => $row["reporter_name"] ?? "Student",
                "reporterEmail" => $row["reporter_email"] ?? "",
                "date" => date("Y-m-d", strtotime($row["claim_created_at"])),
                "message" => $row["message"],
                "status" => $row["claim_status"],
                "verificationStatus" => $row["claim_status"] === "approved" ? "Verified & Approved" : ($row["claim_status"] === "rejected" ? "Rejected" : "Pending Review"),
                "created_at" => $row["claim_created_at"]
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "claims" => $claims
    ]);
    $conn->close();
    exit;
}

// POST: Update claim status with MySQL Transaction Safety
if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    $claimId = (int)($data["claim_id"] ?? 0);
    $newStatus = trim($data["status"] ?? "");

    if ($claimId <= 0 || !in_array($newStatus, ["approved", "rejected"])) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid status parameters. Required: claim_id and status ('approved' or 'rejected')."
        ]);
        $conn->close();
        exit;
    }

    // Begin Transaction
    $conn->begin_transaction();

    try {
        // Fetch target claim & lock row
        $stmt = $conn->prepare("SELECT item_id, claimant_id, status FROM claims WHERE id = ? FOR UPDATE");
        $stmt->bind_param("i", $claimId);
        $stmt->execute();
        $res = $stmt->get_result();

        if ($res->num_rows === 0) {
            $conn->rollback();
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Claim record not found."]);
            $stmt->close();
            $conn->close();
            exit;
        }

        $claimRow = $res->fetch_assoc();
        $stmt->close();

        $itemId = (int)$claimRow["item_id"];
        $claimantId = (int)$claimRow["claimant_id"];

        // Fetch item title
        $itStmt = $conn->prepare("SELECT title FROM items WHERE id = ?");
        $itStmt->bind_param("i", $itemId);
        $itStmt->execute();
        $itRes = $itStmt->get_result()->fetch_assoc();
        $itemTitle = $itRes["title"] ?? "Item #" . $itemId;
        $itStmt->close();

        if ($newStatus === "approved") {
            // Fetch competing pending claims before updating
            $competing = [];
            $compStmt = $conn->prepare("SELECT id, claimant_id FROM claims WHERE item_id = ? AND id != ? AND status = 'pending'");
            $compStmt->bind_param("ii", $itemId, $claimId);
            $compStmt->execute();
            $compRes = $compStmt->get_result();
            while ($cRow = $compRes->fetch_assoc()) {
                $competing[] = [
                    "id" => (int)$cRow["id"],
                    "claimant_id" => (int)$cRow["claimant_id"]
                ];
            }
            $compStmt->close();

            // 1. Update target claim status to 'approved'
            $upClaim = $conn->prepare("UPDATE claims SET status = 'approved' WHERE id = ?");
            $upClaim->bind_param("i", $claimId);
            $upClaim->execute();
            $upClaim->close();

            // 2. Update target item status to 'claimed'
            $upItem = $conn->prepare("UPDATE items SET status = 'claimed' WHERE id = ?");
            $upItem->bind_param("i", $itemId);
            $upItem->execute();
            $upItem->close();

            // 3. Automatically set competing pending claims for the same item to 'rejected'
            $upOthers = $conn->prepare("UPDATE claims SET status = 'rejected' WHERE item_id = ? AND id != ? AND status = 'pending'");
            $upOthers->bind_param("ii", $itemId, $claimId);
            $upOthers->execute();
            $upOthers->close();

            $conn->commit();

            // Dispatch Notifications & Emails post-commit
            // 1. Target claimant approved
            NotificationService::create(
                $conn,
                $claimantId,
                "Claim Approved for " . $itemTitle,
                "Great news! Your ownership claim for " . $itemTitle . " has been verified and approved by campus admins.",
                "claim_approved",
                $itemId,
                $claimId,
                true,
                ["itemTitle" => $itemTitle]
            );

            // 2. Competing claimants rejected
            foreach ($competing as $cItem) {
                NotificationService::create(
                    $conn,
                    $cItem["claimant_id"],
                    "Claim Update for " . $itemTitle,
                    "Another claim for " . $itemTitle . " was approved, so your pending claim was not approved.",
                    "competing_claim_rejected",
                    $itemId,
                    $cItem["id"],
                    true,
                    ["itemTitle" => $itemTitle]
                );
            }

            echo json_encode([
                "success" => true,
                "message" => "Ownership claim approved successfully! Item status updated to 'claimed'."
            ]);
        } elseif ($newStatus === "rejected") {
            // 1. Update target claim status to 'rejected'
            $upClaim = $conn->prepare("UPDATE claims SET status = 'rejected' WHERE id = ?");
            $upClaim->bind_param("i", $claimId);
            $upClaim->execute();
            $upClaim->close();

            // 2. Check if any other active/pending claims exist for this item
            $checkOther = $conn->prepare("SELECT COUNT(*) as active_cnt FROM claims WHERE item_id = ? AND status IN ('pending', 'approved')");
            $checkOther->bind_param("i", $itemId);
            $checkOther->execute();
            $cntRes = $checkOther->get_result()->fetch_assoc();
            $checkOther->close();

            // If no active or pending claims remain, restore item status to 'active'
            if ((int)($cntRes["active_cnt"] ?? 0) === 0) {
                $upItem = $conn->prepare("UPDATE items SET status = 'active' WHERE id = ? AND status = 'claimed'");
                $upItem->bind_param("i", $itemId);
                $upItem->execute();
                $upItem->close();
            }

            $conn->commit();

            // Dispatch notification to claimant post-commit
            NotificationService::create(
                $conn,
                $claimantId,
                "Claim Status Update for " . $itemTitle,
                "We are writing to inform you that your claim for " . $itemTitle . " was rejected.",
                "claim_rejected",
                $itemId,
                $claimId,
                true,
                ["itemTitle" => $itemTitle]
            );

            echo json_encode([
                "success" => true,
                "message" => "Claim has been rejected."
            ]);
        }
    } catch (\Throwable $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Database transaction error: " . $e->getMessage()
        ]);
    }

    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);
$conn->close();

?>
