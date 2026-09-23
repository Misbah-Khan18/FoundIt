<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../config/database.php');
require_once('../../services/NotificationService.php');
require_once('../../middleware/auth.php');
require_once('../../middleware/csrf.php');

// Strict server-side verification: authenticated + non-suspended + admin role in MySQL
$adminId = requireAdmin($conn);

// GET: Fetch all reports for admin moderation
if ($_SERVER["REQUEST_METHOD"] === "GET") {
    $sql = "SELECT i.id, i.user_id, i.type, i.title, i.description, i.category, i.location,
                   i.item_date as date, i.image, i.status, i.created_at,
                   u.name as reporter, u.email as reporter_email,
                   u.phone_number as reporter_phone, u.roll_number as student_id,
                   u.role as reporter_role
            FROM items i
            JOIN users u ON i.user_id = u.id
            ORDER BY i.created_at DESC";

    $result = $conn->query($sql);
    $items = [];
    if ($result) {
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                "id" => (int)$row["id"],
                "user_id" => (int)$row["user_id"],
                "type" => $row["type"],
                "title" => $row["title"],
                "description" => $row["description"] ?? "",
                "category" => $row["category"] ?? "General",
                "location" => $row["location"] ?? "Campus",
                "date" => $row["date"] ?? date("Y-m-d", strtotime($row["created_at"])),
                "image" => $row["image"],
                "status" => $row["status"],
                "created_at" => $row["created_at"],
                "reporter" => $row["reporter"] ?? "Student",
                "reporter_email" => $row["reporter_email"] ?? "",
                "reporterEmail" => $row["reporter_email"] ?? "",
                "reporter_phone" => $row["reporter_phone"] ?? "",
                "reporterPhone" => $row["reporter_phone"] ?? "",
                "student_id" => $row["student_id"] ?? "",
                "studentId" => $row["student_id"] ?? "",
                "reporter_role" => $row["reporter_role"] ?? "student",
            ];
        }
    }

    echo json_encode([
        "success" => true,
        "items" => $items
    ]);
    $conn->close();
    exit;
}

// POST: Update report status
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);
    validateCsrfToken($data);
    $itemId = (int)($data["item_id"] ?? 0);
    $newStatus = trim($data["status"] ?? "");

    $validStatuses = ["active", "under_review", "pending", "matched", "claimed", "resolved", "rejected"];
    if ($itemId <= 0 || !in_array($newStatus, $validStatuses)) {
        http_response_code(400);
        echo json_encode([
            "success" => false,
            "message" => "Invalid status update parameters."
        ]);
        exit;
    }

    $reason = trim($data["reason"] ?? "Report did not meet institutional verification guidelines.");

    $stmt = $conn->prepare("UPDATE items SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $newStatus, $itemId);
    if ($stmt->execute()) {
        // Notify the student who reported this item
        try {
            $itemQ = $conn->prepare("SELECT user_id, title, type FROM items WHERE id = ?");
            if ($itemQ) {
                $itemQ->bind_param("i", $itemId);
                $itemQ->execute();
                $itemRes = $itemQ->get_result();
                if ($iRow = $itemRes->fetch_assoc()) {
                    $reporterId = (int)$iRow["user_id"];
                    $itemTitle = $iRow["title"];
                    $itemType = $iRow["type"];
                    $statusLabels = [
                        "active" => "Active",
                        "under_review" => "Under Review",
                        "pending" => "Pending Review",
                        "matched" => "Matched",
                        "claimed" => "Claimed",
                        "resolved" => "Resolved",
                        "rejected" => "Rejected"
                    ];
                    $readableStatus = $statusLabels[$newStatus] ?? ucfirst($newStatus);

                    $notifBody = ($newStatus === "rejected")
                        ? "Your " . $itemType . " item report '" . $itemTitle . "' was not approved. Reason: " . $reason
                        : "Your " . $itemType . " item report status was updated to '" . $readableStatus . "' by an administrator.";

                    NotificationService::create(
                        $conn,
                        $reporterId,
                        "Status Updated: " . $itemTitle,
                        $notifBody,
                        "status_updated",
                        $itemId,
                        null,
                        false
                    );
                }
                $itemQ->close();
            }
        } catch (\Throwable $e) {
            error_log("Report status notification error: " . $e->getMessage());
        }

        echo json_encode([
            "success" => true,
            "message" => "Report status updated to " . $newStatus
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            "success" => false,
            "message" => "Failed to update item status."
        ]);
    }
    $stmt->close();
    $conn->close();
    exit;
}

// DELETE: Remove report submission
if ($_SERVER["REQUEST_METHOD"] === "DELETE") {
    $data = json_decode(file_get_contents("php://input"), true);
    validateCsrfToken($data);
    $itemId = (int)($data["item_id"] ?? $_GET["item_id"] ?? 0);

    if ($itemId <= 0) {
        http_response_code(400);
        echo json_encode(["success" => false, "message" => "Valid item_id required."]);
        exit;
    }

    $delStmt = $conn->prepare("DELETE FROM items WHERE id = ?");
    $delStmt->bind_param("i", $itemId);
    if ($delStmt->execute()) {
        echo json_encode(["success" => true, "message" => "Report deleted successfully."]);
    } else {
        http_response_code(500);
        echo json_encode(["success" => false, "message" => "Failed to delete report."]);
    }
    $delStmt->close();
    $conn->close();
    exit;
}

http_response_code(405);
echo json_encode(["success" => false, "message" => "Method not allowed."]);

?>
