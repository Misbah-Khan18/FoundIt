<?php

require_once __DIR__ . '/EmailService.php';

class NotificationService {

    /**
     * Create a notification record in DB and optionally send an email.
     * 
     * @param mysqli $conn MySQLi connection
     * @param int $userId Target recipient user ID
     * @param string $title Notification title
     * @param string $message Notification message
     * @param string $type Notification type (e.g. 'match_confirmed', 'claim_submitted', 'claim_approved', 'claim_rejected', 'general')
     * @param int|null $relatedItemId Optional related item ID
     * @param int|null $relatedClaimId Optional related claim ID
     * @param bool $sendEmail Whether to dispatch an email via EmailService
     * @param array $extraData Extra data array for email parameters if needed (e.g. lostItemTitle, foundItemTitle, location, date, claimantName)
     * @return int|bool Created notification ID or false on failure
     */
    public static function create($conn, $userId, $title, $message, $type = 'general', $relatedItemId = null, $relatedClaimId = null, $sendEmail = true, $extraData = []) {
        $userId = (int)$userId;
        if ($userId <= 0) {
            return false;
        }

        $relatedItemId = $relatedItemId ? (int)$relatedItemId : null;
        $relatedClaimId = $relatedClaimId ? (int)$relatedClaimId : null;

        // 1. Duplicate check (prevent spamming identical notification within 5 minutes)
        $dupQuery = "SELECT id FROM notifications 
                    WHERE user_id = ? AND title = ? AND type = ? 
                      AND (related_item_id <=> ?) AND (related_claim_id <=> ?)
                      AND created_at >= NOW() - INTERVAL 5 MINUTE
                    LIMIT 1";
        $dupStmt = $conn->prepare($dupQuery);
        if ($dupStmt) {
            $dupStmt->bind_param("issii", $userId, $title, $type, $relatedItemId, $relatedClaimId);
            $dupStmt->execute();
            $dupRes = $dupStmt->get_result();
            if ($dupRes && $dupRes->num_rows > 0) {
                $dupStmt->close();
                // Already notified recently
                return true;
            }
            $dupStmt->close();
        }

        // 2. Insert Notification into Database
        $stmt = $conn->prepare(
            "INSERT INTO notifications (user_id, title, message, type, related_item_id, related_claim_id, is_read) 
             VALUES (?, ?, ?, ?, ?, ?, 0)"
        );
        if (!$stmt) {
            error_log("NotificationService Insert Prepare Error: " . $conn->error);
            return false;
        }

        $stmt->bind_param("isssii", $userId, $title, $message, $type, $relatedItemId, $relatedClaimId);
        $exec = $stmt->execute();
        $notifId = $conn->insert_id;
        $stmt->close();

        if (!$exec) {
            return false;
        }

        // 3. Optional Email Dispatch via EmailService (Fault Tolerant)
        if ($sendEmail) {
            try {
                // Fetch target user email & name
                $userStmt = $conn->prepare("SELECT name, email FROM users WHERE id = ?");
                if ($userStmt) {
                    $userStmt->bind_param("i", $userId);
                    $userStmt->execute();
                    $uRes = $userStmt->get_result();
                    if ($uRow = $uRes->fetch_assoc()) {
                        $toEmail = $uRow["email"];
                        $toName  = $uRow["name"];

                        self::dispatchEmail($toEmail, $toName, $title, $message, $type, $extraData);
                    }
                    $userStmt->close();
                }
            } catch (\Throwable $e) {
                // Log silently, never fail the DB notification
                error_log("NotificationService Email Dispatch Exception: " . $e->getMessage());
            }
        }

        return $notifId;
    }

    /**
     * Internal helper to dispatch appropriate email template
     */
    private static function dispatchEmail($toEmail, $toName, $title, $message, $type, $extraData) {
        if (empty($toEmail)) return;

        switch ($type) {
            case 'match_confirmed':
                $lostTitle = $extraData['lostItemTitle'] ?? 'Your lost item';
                $foundTitle = $extraData['foundItemTitle'] ?? 'A found item';
                $location = $extraData['location'] ?? 'Campus';
                $date = $extraData['date'] ?? date('Y-m-d');
                EmailService::sendMatchConfirmedEmail($toEmail, $toName, $lostTitle, $foundTitle, $location, $date);
                break;

            case 'claim_approved':
                $itemTitle = $extraData['itemTitle'] ?? 'your claimed item';
                EmailService::sendClaimApprovedEmail($toEmail, $toName, $itemTitle);
                break;

            case 'claim_rejected':
                $itemTitle = $extraData['itemTitle'] ?? 'your claimed item';
                EmailService::sendClaimRejectedEmail($toEmail, $toName, $itemTitle);
                break;

            case 'competing_claim_rejected':
                $itemTitle = $extraData['itemTitle'] ?? 'your claimed item';
                EmailService::sendCompetingClaimRejectedEmail($toEmail, $toName, $itemTitle);
                break;

            case 'claim_submitted':
                $claimantName = $extraData['claimantName'] ?? 'A student';
                $itemTitle = $extraData['itemTitle'] ?? 'your item';
                EmailService::sendClaimSubmittedEmail($toEmail, $toName, $claimantName, $itemTitle);
                break;

            default:
                EmailService::sendGenericNotificationEmail($toEmail, $toName, $title, $message);
                break;
        }
    }
}
