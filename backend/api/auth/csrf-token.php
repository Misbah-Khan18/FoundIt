<?php

require_once('../../config/cors.php');
header("Content-Type: application/json");
require_once('../../middleware/csrf.php');

$token = getCsrfToken();

echo json_encode([
    "success" => true,
    "csrf_token" => $token
]);
