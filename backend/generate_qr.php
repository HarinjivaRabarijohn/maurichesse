<?php
require 'config.php';
require 'phpqrcode/qrlib.php';

$data = json_decode(file_get_contents("php://input"), true);
$location_id = $data['location_id'];
$fact_text   = $data['fun_fact'];

// Generate unique QR code string
$qr_value = 'HERITAGE-' . strtoupper(bin2hex(random_bytes(3))) . '-' . $location_id;

// Save QR in DB
$stmt = $pdo->prepare("INSERT INTO qr (qr_code, location_id) VALUES (?, ?)");
$stmt->execute([$qr_value, $location_id]);
$qr_id = $pdo->lastInsertId();

// Save fun fact
$stmt2 = $pdo->prepare("INSERT INTO fun_fact (qr_id, fact_text) VALUES (?, ?)");
$stmt2->execute([$qr_id, $fact_text]);

// Generate QR image
$filename = "../uploads/qr/" . $qr_value . ".png";
QRcode::png($qr_value, $filename, QR_ECLEVEL_L, 5);

echo json_encode([
    "success" => true,
    "qr_value" => $qr_value,
    "qr_image" => $filename
]);
