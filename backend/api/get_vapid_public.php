<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$file = __DIR__ . '/vapid_public_key.txt';
if (file_exists($file)) {
    $key = trim(file_get_contents($file));
    echo json_encode(['success' => true, 'publicKey' => $key]);
} else {
    echo json_encode(['success' => false, 'message' => 'VAPID public key not configured. Run generate_vapid.php and save keys.']);
}
