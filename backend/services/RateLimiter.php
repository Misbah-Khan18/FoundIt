<?php

/**
 * FoundIt - Centralized Abuse Prevention & Rate Limiter Service
 */

class RateLimiter {
    private static $tableInitialized = false;

    /**
     * Ensures the rate_limits table exists in MySQL.
     */
    private static function ensureTable($conn) {
        if (self::$tableInitialized) return;

        $sql = "CREATE TABLE IF NOT EXISTS rate_limits (
            id INT AUTO_INCREMENT PRIMARY KEY,
            action_key VARCHAR(150) NOT NULL,
            attempts INT NOT NULL DEFAULT 1,
            last_attempt DATETIME NOT NULL,
            locked_until DATETIME NULL,
            UNIQUE KEY uk_action_key (action_key),
            INDEX idx_locked (locked_until),
            INDEX idx_last_attempt (last_attempt)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

        $conn->query($sql);
        self::$tableInitialized = true;
    }

    /**
     * Resolves the client's IP address safely.
     */
    public static function getClientIp() {
        $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
        return '127.0.0.1';
    }

    /**
     * Checks if the specified action key is currently throttled.
     * 
     * @param mysqli $conn
     * @param string $key Unique identifier for action (e.g., "login:ip:127.0.0.1")
     * @param int $maxAttempts Maximum permitted failed attempts
     * @param int $windowSeconds Sliding window duration in seconds
     * @param int $lockoutSeconds Lockout duration in seconds once limit reached
     * @return array ['allowed' => bool, 'retry_after' => int, 'attempts' => int]
     */
    public static function check($conn, $key, $maxAttempts = 5, $windowSeconds = 900, $lockoutSeconds = 900) {
        self::ensureTable($conn);

        // Periodic lazy cleanup of stale unlocked records (> 24 hours old)
        if (rand(1, 50) === 1) {
            $conn->query("DELETE FROM rate_limits WHERE last_attempt < DATE_SUB(NOW(), INTERVAL 1 DAY) AND (locked_until IS NULL OR locked_until < NOW())");
        }

        $stmt = $conn->prepare("SELECT attempts, UNIX_TIMESTAMP(last_attempt) as last_ts, UNIX_TIMESTAMP(locked_until) as lock_ts FROM rate_limits WHERE action_key = ?");
        $stmt->bind_param("s", $key);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row) {
            return ['allowed' => true, 'retry_after' => 0, 'attempts' => 0];
        }

        $now = time();
        $lockTs = (int)($row['lock_ts'] ?? 0);
        $lastTs = (int)($row['last_ts'] ?? 0);
        $attempts = (int)$row['attempts'];

        // 1. If currently locked out
        if ($lockTs > $now) {
            return [
                'allowed' => false,
                'retry_after' => ($lockTs - $now),
                'attempts' => $attempts
            ];
        }

        // 2. If sliding window has completely elapsed without lockout
        if (($now - $lastTs) > $windowSeconds) {
            self::reset($conn, $key);
            return ['allowed' => true, 'retry_after' => 0, 'attempts' => 0];
        }

        // 3. If attempts exceeded limit
        if ($attempts >= $maxAttempts) {
            // Apply lockout now
            $lockUntil = date('Y-m-d H:i:s', $now + $lockoutSeconds);
            $lStmt = $conn->prepare("UPDATE rate_limits SET locked_until = ? WHERE action_key = ?");
            $lStmt->bind_param("ss", $lockUntil, $key);
            $lStmt->execute();
            $lStmt->close();

            return [
                'allowed' => false,
                'retry_after' => $lockoutSeconds,
                'attempts' => $attempts
            ];
        }

        return ['allowed' => true, 'retry_after' => 0, 'attempts' => $attempts];
    }

    /**
     * Records a failed attempt for the action key.
     */
    public static function recordFailure($conn, $key, $maxAttempts = 5, $windowSeconds = 900, $lockoutSeconds = 900) {
        self::ensureTable($conn);
        $now = time();

        $stmt = $conn->prepare("SELECT attempts, UNIX_TIMESTAMP(last_attempt) as last_ts FROM rate_limits WHERE action_key = ?");
        $stmt->bind_param("s", $key);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$row || ($now - (int)$row['last_ts']) > $windowSeconds) {
            // First failure in new window
            $stmt = $conn->prepare(
                "INSERT INTO rate_limits (action_key, attempts, last_attempt, locked_until) 
                 VALUES (?, 1, NOW(), NULL)
                 ON DUPLICATE KEY UPDATE attempts = 1, last_attempt = NOW(), locked_until = NULL"
            );
            $stmt->bind_param("s", $key);
            $stmt->execute();
            $stmt->close();
        } else {
            $newAttempts = (int)$row['attempts'] + 1;
            $lockedUntil = null;
            if ($newAttempts >= $maxAttempts) {
                $lockedUntil = date('Y-m-d H:i:s', $now + $lockoutSeconds);
            }

            if ($lockedUntil !== null) {
                $stmt = $conn->prepare("UPDATE rate_limits SET attempts = ?, last_attempt = NOW(), locked_until = ? WHERE action_key = ?");
                $stmt->bind_param("iss", $newAttempts, $lockedUntil, $key);
            } else {
                $stmt = $conn->prepare("UPDATE rate_limits SET attempts = ?, last_attempt = NOW() WHERE action_key = ?");
                $stmt->bind_param("is", $newAttempts, $key);
            }
            $stmt->execute();
            $stmt->close();
        }
    }

    /**
     * Resets rate limit counter upon successful operation.
     */
    public static function reset($conn, $key) {
        self::ensureTable($conn);
        $stmt = $conn->prepare("DELETE FROM rate_limits WHERE action_key = ?");
        $stmt->bind_param("s", $key);
        $stmt->execute();
        $stmt->close();
    }
}
