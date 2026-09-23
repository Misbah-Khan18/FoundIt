<?php

class MatchingEngine {
    // Centralized Weights (when both items have images)
    public const DESCRIPTION_WEIGHT = 0.45;
    public const IMAGE_WEIGHT       = 0.35;
    public const LOCATION_WEIGHT    = 0.10;
    public const DATE_WEIGHT        = 0.10;

    // Normalized Weights (when one or both items lack images)
    public const NO_IMG_DESC_WEIGHT = 0.70;
    public const NO_IMG_LOC_WEIGHT  = 0.15;
    public const NO_IMG_DATE_WEIGHT = 0.15;

    // Centralized Confidence Thresholds
    public const CONFIDENCE_HIGH     = 75.0;
    public const CONFIDENCE_MEDIUM   = 55.0;
    public const CONFIDENCE_LOW      = 35.0;

    /**
     * Run matching for a single target item against all active opposite-type items.
     */
    public static function runForItem($conn, $itemId) {
        $itemId = (int)$itemId;
        $stmt = $conn->prepare("SELECT * FROM items WHERE id = ?");
        $stmt->bind_param("i", $itemId);
        $stmt->execute();
        $res = $stmt->get_result();
        $target = $res->fetch_assoc();
        $stmt->close();

        if (!$target || $target['status'] === 'resolved') {
            return false;
        }

        $oppositeType = ($target['type'] === 'lost') ? 'found' : 'lost';

        // Query active opposite-type items
        $oppStmt = $conn->prepare("SELECT * FROM items WHERE type = ? AND status != 'resolved'");
        $oppStmt->bind_param("s", $oppositeType);
        $oppStmt->execute();
        $oppRes = $oppStmt->get_result();
        $candidates = [];
        while ($row = $oppRes->fetch_assoc()) {
            $candidates[] = $row;
        }
        $oppStmt->close();

        foreach ($candidates as $cand) {
            $lostItem  = ($target['type'] === 'lost') ? $target : $cand;
            $foundItem = ($target['type'] === 'found') ? $target : $cand;

            self::processMatchPair($conn, $lostItem, $foundItem);
        }

        return true;
    }

    /**
     * Run matching across all active lost items and active found items.
     */
    public static function runAll($conn) {
        $lostQuery = $conn->query("SELECT * FROM items WHERE type = 'lost' AND status != 'resolved'");
        $foundQuery = $conn->query("SELECT * FROM items WHERE type = 'found' AND status != 'resolved'");

        $lostItems = [];
        if ($lostQuery) {
            while ($r = $lostQuery->fetch_assoc()) $lostItems[] = $r;
        }

        $foundItems = [];
        if ($foundQuery) {
            while ($r = $foundQuery->fetch_assoc()) $foundItems[] = $r;
        }

        foreach ($lostItems as $lost) {
            foreach ($foundItems as $found) {
                self::processMatchPair($conn, $lost, $found);
            }
        }

        return true;
    }

    /**
     * Compare a lost item and a found item, calculate sub-scores & overall score,
     * and upsert into the database.
     */
    private static function processMatchPair($conn, $lostItem, $foundItem) {
        $descScore = self::calculateDescriptionScore($lostItem, $foundItem);
        $locScore  = self::calculateLocationScore($lostItem['location'] ?? '', $foundItem['location'] ?? '');
        $dateScore = self::calculateDateScore($lostItem, $foundItem);

        $hasBothImages = !empty($lostItem['image']) && !empty($foundItem['image']);

        if ($hasBothImages) {
            $imgScore = self::calculateImageScore($lostItem, $foundItem);
            $overallScore = round(
                ($descScore * self::DESCRIPTION_WEIGHT) +
                ($imgScore  * self::IMAGE_WEIGHT) +
                ($locScore  * self::LOCATION_WEIGHT) +
                ($dateScore * self::DATE_WEIGHT),
                2
            );
        } else {
            // Adaptive re-normalization: don't penalize items without photos
            $imgScore = 0.0;
            $overallScore = round(
                ($descScore * self::NO_IMG_DESC_WEIGHT) +
                ($locScore  * self::NO_IMG_LOC_WEIGHT) +
                ($dateScore * self::NO_IMG_DATE_WEIGHT),
                2
            );
        }

        $overallScore = min(100.0, max(0.0, $overallScore));
        $confidenceLevel = self::getConfidenceLevel($overallScore);

        $lostId  = (int)$lostItem['id'];
        $foundId = (int)$foundItem['id'];

        $upsertStmt = $conn->prepare("
            INSERT INTO matches 
                (lost_item_id, found_item_id, description_score, image_score, location_score, date_score, overall_score, confidence_level, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
            ON DUPLICATE KEY UPDATE
                description_score = VALUES(description_score),
                image_score       = VALUES(image_score),
                location_score    = VALUES(location_score),
                date_score        = VALUES(date_score),
                overall_score     = VALUES(overall_score),
                confidence_level  = VALUES(confidence_level),
                updated_at        = CURRENT_TIMESTAMP
        ");

        $upsertStmt->bind_param(
            "iiddddds",
            $lostId,
            $foundId,
            $descScore,
            $imgScore,
            $locScore,
            $dateScore,
            $overallScore,
            $confidenceLevel
        );

        $upsertStmt->execute();
        $upsertStmt->close();
    }

    /**
     * Map numerical overall score to confidence level category.
     */
    public static function getConfidenceLevel($score) {
        if ($score >= self::CONFIDENCE_HIGH) {
            return 'HIGH';
        } elseif ($score >= self::CONFIDENCE_MEDIUM) {
            return 'MEDIUM';
        } elseif ($score >= self::CONFIDENCE_LOW) {
            return 'LOW';
        }
        return 'VERY_LOW';
    }

    /**
     * Calculate Description Similarity Score (0 - 100)
     * Text normalization, title-aware weighting, and category match bonus.
     */
    public static function calculateDescriptionScore($item1, $item2) {
        $t1 = strtolower(trim($item1['title'] ?? ''));
        $t2 = strtolower(trim($item2['title'] ?? ''));
        $d1 = strtolower(trim($item1['description'] ?? ''));
        $d2 = strtolower(trim($item2['description'] ?? ''));

        $titleScore = self::calculateTextSimilarity($t1, $t2);
        $descScore  = self::calculateTextSimilarity($d1, $d2);

        // If either description is brief (< 12 chars), rely primarily on Title
        if (strlen($d1) < 12 || strlen($d2) < 12) {
            $textScore = ($titleScore * 0.80) + ($descScore * 0.20);
        } else {
            // When both descriptions are present, balance 50/50
            $textScore = ($titleScore * 0.50) + ($descScore * 0.50);
        }

        // If Title is a strong match (>= 75%), ensure high floor
        if ($titleScore >= 75.0 && $textScore < ($titleScore * 0.85)) {
            $textScore = $titleScore * 0.85;
        }

        // Category bonus (+15% if exact match, +5% if general/other)
        $c1 = strtolower(trim($item1['category'] ?? ''));
        $c2 = strtolower(trim($item2['category'] ?? ''));
        if (!empty($c1) && !empty($c2)) {
            if ($c1 === $c2) {
                $textScore += 15.0;
            } elseif ($c1 === 'general' || $c1 === 'other' || $c2 === 'general' || $c2 === 'other') {
                $textScore += 5.0;
            }
        }

        return round(min(100.0, max(0.0, $textScore)), 2);
    }

    /**
     * Helper to tokenize, remove stop words, and calculate Jaccard & Token Overlap similarity (0 - 100).
     */
    private static function calculateTextSimilarity($str1, $str2) {
        if (empty($str1) || empty($str2)) {
            return 0.0;
        }

        // Exact match check
        if ($str1 === $str2) {
            return 100.0;
        }

        $stopWords = [
            'a','an','the','is','it','in','on','at','for','with','and','or','of','to','my','me',
            'found','lost','item','please','this','that','was','has','have','case','i','by','near',
            'front','back','side','block','area'
        ];

        // Clean punctuation & split tokens
        $clean1 = preg_replace('/[^\w\s]/u', ' ', $str1);
        $clean2 = preg_replace('/[^\w\s]/u', ' ', $str2);

        $tokens1 = array_values(array_diff(array_filter(explode(' ', $clean1)), $stopWords));
        $tokens2 = array_values(array_diff(array_filter(explode(' ', $clean2)), $stopWords));

        if (empty($tokens1) || empty($tokens2)) {
            // Fallback to substring matching on raw strings
            if (stripos($str1, $str2) !== false || stripos($str2, $str1) !== false) {
                return 75.0;
            }
            return 0.0;
        }

        // Count term frequencies
        $intersect = array_intersect($tokens1, $tokens2);
        $union     = array_unique(array_merge($tokens1, $tokens2));

        $jaccard = count($union) > 0 ? (count($intersect) / count($union)) : 0;

        // Substring token match bonus (e.g. "s24" in "galaxy s24 ultra")
        $partialMatches = 0;
        foreach ($tokens1 as $w1) {
            foreach ($tokens2 as $w2) {
                if (strlen($w1) > 2 && strlen($w2) > 2) {
                    if (stripos($w1, $w2) !== false || stripos($w2, $w1) !== false) {
                        $partialMatches++;
                        break;
                    }
                }
            }
        }
        $partialRatio = $partialMatches / max(count($tokens1), count($tokens2));

        $combinedRatio = max($jaccard, $partialRatio);
        return round($combinedRatio * 100.0, 2);
    }

    /**
     * Calculate Image Similarity Score (0 - 100).
     * Deterministic comparison using image features.
     * Returns 0.0 if image is missing on either item.
     */
    public static function calculateImageScore($item1, $item2) {
        $img1Rel = $item1['image'] ?? null;
        $img2Rel = $item2['image'] ?? null;

        if (empty($img1Rel) || empty($img2Rel)) {
            return 0.0;
        }

        $baseDir = __DIR__ . '/../';
        $path1 = realpath($baseDir . $img1Rel);
        $path2 = realpath($baseDir . $img2Rel);

        if (!$path1 || !$path2 || !file_exists($path1) || !file_exists($path2)) {
            return 0.0;
        }

        // If paths are identical, return 100%
        if ($path1 === $path2) {
            return 100.0;
        }

        // Try GD extension image comparison if available
        if (function_exists('imagecreatefromstring')) {
            $score = self::compareImagesGD($path1, $path2);
            if ($score !== false) {
                return round($score, 2);
            }
        }

        // Fallback: Deterministic structural byte signature & aspect ratio comparison
        return round(self::compareImagesFallback($path1, $path2), 2);
    }

    /**
     * GD-based Perceptual Hash (Average Hash / dHash) Image Comparison
     */
    private static function compareImagesGD($path1, $path2) {
        try {
            $data1 = @file_get_contents($path1);
            $data2 = @file_get_contents($path2);
            if (!$data1 || !$data2) return false;

            $im1 = @imagecreatefromstring($data1);
            $im2 = @imagecreatefromstring($data2);
            if (!$im1 || !$im2) return false;

            // 1. Calculate aspect ratio similarity
            $w1 = imagesx($im1); $h1 = imagesy($im1);
            $w2 = imagesx($im2); $h2 = imagesy($im2);
            $ar1 = $h1 > 0 ? ($w1 / $h1) : 1.0;
            $ar2 = $h2 > 0 ? ($w2 / $h2) : 1.0;
            $arSim = 1.0 - min(1.0, abs($ar1 - $ar2) / max($ar1, $ar2));

            // 2. Resize to 8x8 grayscale for average hashing
            $hash1 = self::getAverageHash($im1);
            $hash2 = self::getAverageHash($im2);

            imagedestroy($im1);
            imagedestroy($im2);

            if ($hash1 === false || $hash2 === false) return false;

            // Compute Hamming Distance
            $hammingDist = 0;
            for ($i = 0; $i < 64; $i++) {
                if ($hash1[$i] !== $hash2[$i]) {
                    $hammingDist++;
                }
            }

            $hashSim = (64 - $hammingDist) / 64.0; // 0 to 1.0

            // Combine 80% hash similarity + 20% aspect ratio similarity
            $totalSim = ($hashSim * 0.80) + ($arSim * 0.20);
            return $totalSim * 100.0;
        } catch (\Throwable $e) {
            return false;
        }
    }

    /**
     * Compute 64-bit Average Hash string from GD Image resource
     */
    private static function getAverageHash($im) {
        $thumb = imagecreatetruecolor(8, 8);
        imagecopyresampled($thumb, $im, 0, 0, 0, 0, 8, 8, imagesx($im), imagesy($im));

        $grays = [];
        $sum = 0;
        for ($y = 0; $y < 8; $y++) {
            for ($x = 0; $x < 8; $x++) {
                $rgb = imagecolorat($thumb, $x, $y);
                $r = ($rgb >> 16) & 0xFF;
                $g = ($rgb >> 8) & 0xFF;
                $b = $rgb & 0xFF;
                $gray = (int)($r * 0.299 + $g * 0.587 + $b * 0.114);
                $grays[] = $gray;
                $sum += $gray;
            }
        }
        imagedestroy($thumb);

        $avg = $sum / 64.0;
        $hash = '';
        foreach ($grays as $g) {
            $hash .= ($g >= $avg) ? '1' : '0';
        }
        return $hash;
    }

    /**
     * Deterministic Image Comparison fallback when GD is unavailable
     */
    private static function compareImagesFallback($path1, $path2) {
        $size1 = filesize($path1);
        $size2 = filesize($path2);
        if ($size1 === 0 || $size2 === 0) return 0.0;

        // Size ratio similarity
        $sizeSim = 1.0 - min(1.0, abs($size1 - $size2) / max($size1, $size2));

        // Get image dimensions if getimagesize is available
        $dimSim = 0.5;
        if (function_exists('getimagesize')) {
            $info1 = @getimagesize($path1);
            $info2 = @getimagesize($path2);
            if ($info1 && $info2) {
                $ar1 = $info1[0] / max(1, $info1[1]);
                $ar2 = $info2[0] / max(1, $info2[1]);
                $dimSim = 1.0 - min(1.0, abs($ar1 - $ar2) / max($ar1, $ar2));
            }
        }

        // Byte histogram similarity
        $data1 = file_get_contents($path1, false, null, 0, 4096);
        $data2 = file_get_contents($path2, false, null, 0, 4096);
        $hash1 = md5($data1);
        $hash2 = md5($data2);

        $dist = lev($hash1, $hash2);
        $hashSim = (32 - $dist) / 32.0;

        return (($hashSim * 0.5) + ($dimSim * 0.3) + ($sizeSim * 0.2)) * 100.0;
    }

    /**
     * Calculate Location Similarity Score (0 - 100)
     */
    public static function calculateLocationScore($loc1, $loc2) {
        $l1 = strtolower(trim($loc1));
        $l2 = strtolower(trim($loc2));

        if (empty($l1) || empty($l2)) {
            return 25.0; // neutral baseline when location is not specified
        }

        if ($l1 === $l2) {
            return 100.0;
        }

        // Check if one location is a substring of the other (e.g. "Library" and "Central Library")
        if (stripos($l1, $l2) !== false || stripos($l2, $l1) !== false) {
            return 85.0;
        }

        // Campus common central collection / security hubs
        $campusHubs = ['main building', 'security desk', 'reception', 'canteen', 'cafeteria', 'ground floor'];
        $isHub1 = false;
        $isHub2 = false;
        foreach ($campusHubs as $hub) {
            if (stripos($l1, $hub) !== false) $isHub1 = true;
            if (stripos($l2, $hub) !== false) $isHub2 = true;
        }
        $hubBaseline = ($isHub1 || $isHub2) ? 35.0 : 0.0;

        // Token overlap
        $stopWords = ['campus', 'building', 'near', 'at', 'in', 'the', 'room', 'floor', 'block', 'hall'];
        $clean1 = preg_replace('/[^\w\s]/u', ' ', $l1);
        $clean2 = preg_replace('/[^\w\s]/u', ' ', $l2);

        $tokens1 = array_values(array_diff(array_filter(explode(' ', $clean1)), $stopWords));
        $tokens2 = array_values(array_diff(array_filter(explode(' ', $clean2)), $stopWords));

        if (empty($tokens1) || empty($tokens2)) {
            return $hubBaseline;
        }

        $intersect = array_intersect($tokens1, $tokens2);
        $union     = array_unique(array_merge($tokens1, $tokens2));

        if (count($intersect) > 0) {
            $jaccard = count($intersect) / count($union);
            return round(min(100.0, max(50.0, $jaccard * 100.0)), 2);
        }

        return $hubBaseline;
    }

    /**
     * Calculate Date Proximity Score (0 - 100)
     * 0 days = 100%, 1 day = 90%, 3 days = 70%, 7 days = 50%, 14 days = 30%, 30 days = 20%, >30 days = 10%
     */
    public static function calculateDateScore($item1, $item2) {
        $d1Str = $item1['item_date'] ?? $item1['created_at'] ?? null;
        $d2Str = $item2['item_date'] ?? $item2['created_at'] ?? null;

        if (!$d1Str || !$d2Str) {
            return 50.0; // neutral score when dates missing
        }

        $time1 = strtotime($d1Str);
        $time2 = strtotime($d2Str);

        if (!$time1 || !$time2) {
            return 50.0;
        }

        $diffSec = abs($time1 - $time2);
        $diffDays = $diffSec / (60 * 60 * 24);

        if ($diffDays < 0.5) {
            return 100.0;
        } elseif ($diffDays <= 1.0) {
            return 90.0;
        } elseif ($diffDays <= 3.0) {
            return 70.0;
        } elseif ($diffDays <= 7.0) {
            return 50.0;
        } elseif ($diffDays <= 14.0) {
            return 30.0;
        } elseif ($diffDays <= 30.0) {
            return 20.0;
        } else {
            return 10.0;
        }
    }
}

// Levenshtein helper for fallback string comparison
if (!function_exists('lev')) {
    function lev($s1, $s2) {
        return levenshtein($s1, $s2);
    }
}
