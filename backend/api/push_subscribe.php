<?php
session_start();
require 'config.php';
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : null;
if (!$data || empty($data['endpoint']) || empty($data['keys']['p256dh']) || empty($data['keys']['auth'])) {
    echo json_encode(['success' => false, 'message' => 'endpoint, keys.p256dh and keys.auth required']);
    exit;
}

$user_id = null;
if (!empty($_SESSION['user_id'])) {
    $user_id = (int)$_SESSION['user_id'];
} else {
    $uid = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    if ($uid) $user_id = $uid;
}

$endpoint = $data['endpoint'];
$p256dh = $data['keys']['p256dh'];
$auth = $data['keys']['auth'];

try {
    $stmt = $pdo->prepare("INSERT INTO push_subscription (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), p256dh = VALUES(p256dh), auth = VALUES(auth)");
    $stmt->execute([$user_id, $endpoint, $p256dh, $auth]);
} catch (\Throwable $e) {
    try {
        $stmt = $pdo->prepare("INSERT INTO push_subscription (user_id, endpoint, p256dh, auth) VALUES (?, ?, ?, ?)");
        $stmt->execute([$user_id, $endpoint, $p256dh, $auth]);
    } catch (\Throwable $e2) {
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e2->getMessage()]);
        exit;
    }
}

echo json_encode(['success' => true, 'message' => 'Subscription saved']);
