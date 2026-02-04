<?php
require 'vendor/autoload.php';

use Minishlink\WebPush\VAPID;

$keys = VAPID::createVapidKeys();
$apiDir = __DIR__ . '/api';
if (!is_dir($apiDir)) $apiDir = __DIR__;
file_put_contents($apiDir . '/vapid_public_key.txt', $keys['publicKey']);
file_put_contents($apiDir . '/vapid_private_key.txt', $keys['privateKey']);

echo "VAPID keys generated and saved to api/vapid_public_key.txt and api/vapid_private_key.txt" . PHP_EOL;
echo "Public Key: " . $keys['publicKey'] . PHP_EOL;
echo "Private Key: (stored in file - keep secret)" . PHP_EOL;
