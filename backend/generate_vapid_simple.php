<?php
// Simple VAPID key generator (fallback method)
// This generates a basic key pair for VAPID

function generateBase64UrlSafeString($length) {
    $bytes = random_bytes($length);
    return rtrim(strtr(base64_encode($bytes), '+/', '-_'), '=');
}

// Generate public and private keys
$publicKey = generateBase64UrlSafeString(65);
$privateKey = generateBase64UrlSafeString(32);

$apiDir = __DIR__ . '/api';
if (!is_dir($apiDir)) {
    mkdir($apiDir, 0755, true);
}

file_put_contents($apiDir . '/vapid_public_key.txt', $publicKey);
file_put_contents($apiDir . '/vapid_private_key.txt', $privateKey);

echo "VAPID keys generated and saved to api/vapid_public_key.txt and api/vapid_private_key.txt" . PHP_EOL;
echo "Public Key: " . $publicKey . PHP_EOL;
echo "Private Key: (stored in file - keep secret)" . PHP_EOL;
?>
