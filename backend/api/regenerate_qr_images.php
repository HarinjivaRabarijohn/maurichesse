<?php
/**
 * One-time script to generate QR code images for existing QR codes
 * Run once to populate image_path for all existing QR codes
 */
require 'config.php';
require_once 'phpqrcode/qrlib.php';

// Get all QR codes without images
$stmt = $pdo->query("SELECT qr_id, qr_code, image_path FROM qr");
$qrs = $stmt->fetchAll(PDO::FETCH_ASSOC);

$uploaddir = __DIR__ . '/../uploads/qr/';
if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);

$results = [];
foreach($qrs as $qr){
    $qr_id = $qr['qr_id'];
    $qr_code = $qr['qr_code'];
    
    // Skip if already has image
    if(!empty($qr['image_path']) && file_exists(__DIR__ . '/../' . $qr['image_path'])){
        $results[] = ['qr_id'=>$qr_id, 'qr_code'=>$qr_code, 'status'=>'exists', 'path'=>$qr['image_path']];
        continue;
    }
    
    // Generate image
    $safe = preg_replace('/[^A-Za-z0-9\-_]/', '_', $qr_code);
    $filename = $uploaddir . $safe . '.png';
    $image_path = 'uploads/qr/' . $safe . '.png';
    
    try {
        QRcode::png($qr_code, $filename, QR_ECLEVEL_L, 5);
        
        // Update database
        $update = $pdo->prepare("UPDATE qr SET image_path=? WHERE qr_id=?");
        $update->execute([$image_path, $qr_id]);
        
        $results[] = ['qr_id'=>$qr_id, 'qr_code'=>$qr_code, 'status'=>'generated', 'path'=>$image_path];
    } catch (\Throwable $e) {
        $results[] = ['qr_id'=>$qr_id, 'qr_code'=>$qr_code, 'status'=>'failed', 'error'=>$e->getMessage()];
    }
}

header('Content-Type: application/json');
echo json_encode([
    'success'=>true,
    'message'=>'QR image regeneration complete',
    'results'=>$results,
    'total'=>count($qrs),
    'generated'=>count(array_filter($results, function($r){ return $r['status']==='generated'; })),
    'exists'=>count(array_filter($results, function($r){ return $r['status']==='exists'; })),
    'failed'=>count(array_filter($results, function($r){ return $r['status']==='failed'; }))
]);
?>
