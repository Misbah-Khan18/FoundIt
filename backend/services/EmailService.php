<?php

// Check if PHPMailer is loaded (via Composer or manual include)
$autoloadPath = __DIR__ . '/../vendor/autoload.php';
if (file_exists($autoloadPath)) {
    require_once $autoloadPath;
} else {
    // Manual fallback for PHPMailer (check both PHPMailer-6.9.1 and vendor paths)
    $possibleDirs = [
        __DIR__ . '/../PHPMailer-6.9.1/src/',
        __DIR__ . '/../vendor/PHPMailer/src/',
    ];
    foreach ($possibleDirs as $phpmailerDir) {
        if (file_exists($phpmailerDir . 'Exception.php')) {
            require_once $phpmailerDir . 'Exception.php';
            require_once $phpmailerDir . 'PHPMailer.php';
            require_once $phpmailerDir . 'SMTP.php';
            break;
        }
    }
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    
    private static function getMailer() {
        if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
            throw new \Exception("PHPMailer is not installed.");
        }
        
        $mail = new PHPMailer(true);
        
        // Load configuration from .env or config file
        $envFiles = [
            __DIR__ . '/../../.env',
            __DIR__ . '/../.env'
        ];
        $env = [];
        foreach ($envFiles as $envFile) {
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if ($trimmed === '' || strpos($trimmed, '#') === 0) continue;
                    if (strpos($trimmed, '=') !== false) {
                        list($name, $value) = explode('=', $trimmed, 2);
                        $env[trim($name)] = trim($value);
                    }
                }
                break;
            }
        }
        
        $smtpHost = !empty($env['SMTP_HOST']) ? $env['SMTP_HOST'] : (getenv('SMTP_HOST') ?: '');
        $smtpPort = !empty($env['SMTP_PORT']) ? (int)$env['SMTP_PORT'] : (getenv('SMTP_PORT') ? (int)getenv('SMTP_PORT') : 587);
        $smtpUsername = !empty($env['SMTP_USERNAME']) ? $env['SMTP_USERNAME'] : (getenv('SMTP_USERNAME') ?: '');
        $smtpPassword = !empty($env['SMTP_PASSWORD']) ? $env['SMTP_PASSWORD'] : (getenv('SMTP_PASSWORD') ?: '');
        $smtpEncryption = !empty($env['SMTP_ENCRYPTION']) ? strtolower($env['SMTP_ENCRYPTION']) : (getenv('SMTP_ENCRYPTION') ? strtolower(getenv('SMTP_ENCRYPTION')) : 'tls');
        $mailFromAddress = !empty($env['MAIL_FROM_ADDRESS']) ? $env['MAIL_FROM_ADDRESS'] : (getenv('MAIL_FROM_ADDRESS') ?: 'noreply@foundit.local');
        $mailFromName = !empty($env['MAIL_FROM_NAME']) ? $env['MAIL_FROM_NAME'] : (getenv('MAIL_FROM_NAME') ?: 'FoundIt');
        
        if (empty($smtpHost)) {
            throw new \Exception("SMTP configuration is incomplete.");
        }

        $mail->isSMTP();
        $mail->Host       = $smtpHost;
        $mail->SMTPAuth   = !empty($smtpUsername);
        $mail->Username   = $smtpUsername;
        $mail->Password   = $smtpPassword;
        if ($smtpEncryption === 'tls' || $smtpEncryption === 'ssl') {
            $mail->SMTPSecure = $smtpEncryption;
        }
        $mail->Port       = $smtpPort;
        $mail->Timeout    = 15;
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            ]
        ];
        $mail->CharSet    = 'UTF-8';
        
        $mail->setFrom($mailFromAddress, $mailFromName);
        
        return $mail;
    }

    /**
     * Check if SMTP host is configured
     */
    public static function isConfigured() {
        $envFiles = [
            __DIR__ . '/../../.env',
            __DIR__ . '/../.env'
        ];
        $env = [];
        foreach ($envFiles as $envFile) {
            if (file_exists($envFile)) {
                $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
                foreach ($lines as $line) {
                    $trimmed = trim($line);
                    if ($trimmed === '' || strpos($trimmed, '#') === 0) continue;
                    if (strpos($trimmed, '=') !== false) {
                        list($name, $value) = explode('=', $trimmed, 2);
                        $env[trim($name)] = trim($value);
                    }
                }
                break;
            }
        }
        $host = !empty($env['SMTP_HOST']) ? $env['SMTP_HOST'] : (getenv('SMTP_HOST') ?: '');
        return !empty($host);
    }
    
    /**
     * Internal function to handle the safe sending of email.
     * Never crashes the application if sending fails.
     */
    private static function sendSafeEmail($toEmail, $toName, $subject, $htmlBody, $textBody) {
        try {
            $mail = self::getMailer();
            $mail->addAddress($toEmail, $toName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = $textBody;
            
            $res = $mail->send();
            return $res;
        } catch (\Throwable $e) {
            // Log the error safely, do not expose to user or crash script
            error_log("EmailService Error: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Send password reset email with secure token link
     */
    public static function sendPasswordResetEmail($toEmail, $toName, $resetLink) {
        $subject = "FoundIt — Password Reset Instructions";
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;'>
            <h2 style='color: #1e3674;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>We received a request to reset the password for your FoundIt account.</p>
            <p style='margin: 24px 0;'>
                <a href='" . htmlspecialchars($resetLink) . "' style='background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;'>Reset Your Password</a>
            </p>
            <p>If the button above does not work, copy and paste this link into your browser:</p>
            <p style='word-break: break-all; color: #3b82f6;'><a href='" . htmlspecialchars($resetLink) . "'>" . htmlspecialchars($resetLink) . "</a></p>
            <p style='color: #64748b; font-size: 0.85rem;'>This link will expire in 1 hour. If you did not make this request, you can safely ignore this email.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nWe received a request to reset the password for your FoundIt account.\n\nPlease visit this link to reset your password (link expires in 1 hour):\n$resetLink\n\nIf you did not make this request, you can safely ignore this email.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }

    /**
     * Send email when Smart Match is confirmed by Admin
     */
    public static function sendMatchConfirmedEmail($toEmail, $toName, $lostItemTitle, $foundItemTitle, $location, $date) {
        $subject = "FoundIt — Your Lost Item Has Been Matched";
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #2563eb;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>An administrator has reviewed and confirmed a match for your lost item.</p>
            <div style='background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;'>
                <p><strong>Your Lost Item:</strong> " . htmlspecialchars($lostItemTitle) . "</p>
                <p><strong>Matched Found Item:</strong> " . htmlspecialchars($foundItemTitle) . "</p>
                <p><strong>Location:</strong> " . htmlspecialchars($location) . "</p>
                <p><strong>Date Found:</strong> " . htmlspecialchars($date) . "</p>
            </div>
            <p>Please log in to your FoundIt account to view the details and submit a claim if you haven't already.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nAn administrator has reviewed and confirmed a match for your lost item.\n\nYour Lost Item: $lostItemTitle\nMatched Found Item: $foundItemTitle\nLocation: $location\nDate Found: $date\n\nPlease log in to your FoundIt account to view the details and submit a claim.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }

    /**
     * Send email when a claim is approved
     */
    public static function sendClaimApprovedEmail($toEmail, $toName, $itemTitle) {
        $subject = "FoundIt — Your Claim Has Been Approved";
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #10b981;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>Great news! Your claim for <strong>" . htmlspecialchars($itemTitle) . "</strong> has been approved.</p>
            <p>Please follow your campus guidelines to collect your item.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nGreat news! Your claim for $itemTitle has been approved.\n\nPlease follow your campus guidelines to collect your item.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }

    /**
     * Send email when a claim is rejected
     */
    public static function sendClaimRejectedEmail($toEmail, $toName, $itemTitle) {
        $subject = "FoundIt — Update on Your Claim";
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #ef4444;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>We are writing to inform you that your claim for <strong>" . htmlspecialchars($itemTitle) . "</strong> has been rejected.</p>
            <p>This may happen if ownership proof was insufficient or another claim was validated.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nWe are writing to inform you that your claim for $itemTitle has been rejected.\n\nThis may happen if ownership proof was insufficient or another claim was validated.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }
    
    /**
     * Send email when a competing claim is rejected because another was approved
     */
    public static function sendCompetingClaimRejectedEmail($toEmail, $toName, $itemTitle) {
        $subject = "FoundIt — Update on Your Claim";
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #f59e0b;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>Another claim for <strong>" . htmlspecialchars($itemTitle) . "</strong> has been approved, so your pending claim was not approved.</p>
            <p>Thank you for using FoundIt.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nAnother claim for $itemTitle has been approved, so your pending claim was not approved.\n\nThank you for using FoundIt.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }

    /**
     * Send email when a claim is submitted for an item
     */
    public static function sendClaimSubmittedEmail($toEmail, $toName, $claimantName, $itemTitle) {
        $subject = "FoundIt — New Claim Submitted for " . $itemTitle;
        
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #3b82f6;'>FoundIt</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>A new claim has been submitted by <strong>" . htmlspecialchars($claimantName) . "</strong> for your reported item: <strong>" . htmlspecialchars($itemTitle) . "</strong>.</p>
            <p>Please log in to your FoundIt account to review the claim verification details.</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\nA new claim has been submitted by $claimantName for your reported item: $itemTitle.\n\nPlease log in to your FoundIt account to review details.\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }

    /**
     * Send generic notification email
     */
    public static function sendGenericNotificationEmail($toEmail, $toName, $subject, $messageBody) {
        $html = "
        <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;'>
            <h2 style='color: #2563eb;'>FoundIt Notification</h2>
            <p>Hello <strong>" . htmlspecialchars($toName) . "</strong>,</p>
            <p>" . nl2br(htmlspecialchars($messageBody)) . "</p>
            <p>Best regards,<br>The FoundIt Team</p>
        </div>";
        
        $text = "Hello $toName,\n\n$messageBody\n\nBest regards,\nThe FoundIt Team";
        
        return self::sendSafeEmail($toEmail, $toName, $subject, $html, $text);
    }
}
