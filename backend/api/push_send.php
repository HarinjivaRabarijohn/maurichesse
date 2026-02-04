<?php
require 'config.php';
require __DIR__ . '/../vendor/autoload.php';

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

header('Content-Type: application/json');

$publicFile = __DIR__ . '/vapid_public_key.txt';
$privateFile = __DIR__ . '/vapid_private_key.txt';
if (!file_exists($publicFile) || !file_exists($privateFile)) {
    echo json_encode(['success' => false, 'message' => 'VAPID keys not found. Run generate_vapid.php and save keys.']);
    exit;
}

$raw = file_get_contents('php://input');
$data = $raw ? json_decode($raw, true) : [];
$title = $data['title'] ?? 'MauRichesse';
$body = $data['body'] ?? 'New update!';
$url = $data['url'] ?? '';

$auth = [
    'VAPID' => [
        'subject' => 'mailto:admin@maurichesse.local',
        'publicKey' => trim(file_get_contents($publicFile)),
        'privateKey' => trim(file_get_contents($privateFile)),
    ],
];

try {
    $webPush = new WebPush($auth);
    $stmt = $pdo->query("SELECT endpoint, p256dh, auth FROM push_subscription");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $sent = 0;
    $failed = 0;
    foreach ($rows as $row) {
        $subscription = Subscription::create([
            'endpoint' => $row['endpoint'],
            'keys' => [
                'p256dh' => $row['p256dh'],
                'auth' => $row['auth'],
            ],
        ]);
        $payload = json_encode([
            'title' => $title,
            'message' => $body,
            'click_action' => $url,
            'tag' => 'maurichesse',
        ]);
        $report = $webPush->sendOneNotification($subscription, $payload);
        if ($report->isSuccess()) {
            $sent++;
        } else {
            $failed++;
        }
    }
    echo json_encode(['success' => true, 'sent' => $sent, 'failed' => $failed, 'total' => count($rows)]);
} catch (\Throwable $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
