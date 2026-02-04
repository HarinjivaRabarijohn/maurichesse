<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query("SELECT q.*, l.name AS location_name FROM qr q LEFT JOIN location l ON q.location_id=l.location_id ORDER BY q.qr_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Scan QR: return location + riddle & hint for treasure hunt
if($action==='scan'){
    $code = trim($_GET['code'] ?? '');
    if($code === ''){
        echo json_encode(['success'=>false,'message'=>'Code required']);
        exit;
    }
    $stmt = $pdo->prepare("SELECT q.qr_id, q.qr_code, q.location_id FROM qr q WHERE q.qr_code = ? LIMIT 1");
    $stmt->execute([$code]);
    $qr = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$qr){
        echo json_encode(['success'=>false,'message'=>'QR code not found','code'=>$code]);
        exit;
    }
    $locStmt = $pdo->prepare("SELECT l.*, c.category_name FROM location l LEFT JOIN category c ON l.category_id=c.category_id WHERE l.location_id=?");
    $locStmt->execute([$qr['location_id']]);
    $location = $locStmt->fetch(PDO::FETCH_ASSOC);
    $hiddenItem = null;
    try {
        $hiddenStmt = $pdo->prepare("SELECT item_id, name, description, latitude, longitude, found_by_user_id, found_at FROM hidden_item WHERE location_id=? ORDER BY item_id ASC LIMIT 1");
        $hiddenStmt->execute([$qr['location_id']]);
        $hiddenItem = $hiddenStmt->fetch(PDO::FETCH_ASSOC);
        if ($hiddenItem) {
            $hiddenItem['claimed'] = !empty($hiddenItem['found_by_user_id']);
        }
    } catch (\Throwable $e) {
        $hiddenItem = null;
    }
    $riddle = ''; $hints = [];
    $hint_text = ''; $hint_2 = ''; $hint_3 = '';
    try {
        $factStmt = $pdo->prepare("SELECT fact_text, hint_text, hint_2, hint_3 FROM fun_fact WHERE qr_id=? ORDER BY fun_fact_id ASC LIMIT 1");
        $factStmt->execute([$qr['qr_id']]);
        $row = $factStmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $riddle = $row['fact_text'] ?? '';
            $hint_text = $row['hint_text'] ?? '';
            $hint_2 = $row['hint_2'] ?? '';
            $hint_3 = $row['hint_3'] ?? '';
            if (!empty($hint_text)) $hints[] = $hint_text;
            if (!empty($hint_2)) $hints[] = $hint_2;
            if (!empty($hint_3)) $hints[] = $hint_3;
        }
    } catch (\Throwable $e) {
        $factStmt = $pdo->prepare("SELECT fact_text, hint_text FROM fun_fact WHERE qr_id=? ORDER BY fun_fact_id ASC LIMIT 1");
        $factStmt->execute([$qr['qr_id']]);
        $row = $factStmt->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            $riddle = $row['fact_text'] ?? '';
            $hint_text = $row['hint_text'] ?? '';
            if (!empty($hint_text)) $hints[] = $hint_text;
        }
    }
    $hint = $hints[0] ?? '';
    echo json_encode([
        'success'=>true,
        'code'=>$qr['qr_code'],
        'location'=>$location,
        'riddle'=>$riddle,
        'hint'=>$hint,
        'hint_text'=>$hint_text,
        'hint_2'=>$hint_2,
        'hint_3'=>$hint_3,
        'hints'=>$hints,
        'hidden_item'=>$hiddenItem
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['qr_id'] ?? null;

if($action==='add'){
    $stmt = $pdo->prepare("INSERT INTO qr(qr_code,location_id) VALUES(?,?)");
    $stmt->execute([$data['qr_code']??'', $data['location_id']??0]);
    echo json_encode(['success'=>true,'message'=>'QR added']); exit;
}

if($action==='update'){
    $stmt = $pdo->prepare("UPDATE qr SET qr_code=?, location_id=?, image_path=? WHERE qr_id=?");
    $stmt->execute([$data['qr_code']??'', $data['location_id']??0, $data['image_path']??null, $id]);
    echo json_encode(['success'=>true,'message'=>'QR updated']); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM qr WHERE qr_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'QR deleted']); exit;
}

// Generate QR code image: create new QR row + PNG file for a location
if($action==='generate'){
    $loc_id = (int)($data['location_id'] ?? $_POST['location_id'] ?? 0);
    if(!$loc_id){ echo json_encode(['success'=>false,'message'=>'location_id required']); exit; }
    $custom_code = trim($data['qr_code'] ?? $_POST['qr_code'] ?? '');
    $qr_value = $custom_code !== '' ? $custom_code : ('MAU-' . strtoupper(bin2hex(random_bytes(3))) . '-' . $loc_id);
    $uploaddir = __DIR__ . '/../uploads/qr/';
    if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
    $safe = preg_replace('/[^A-Za-z0-9\-_]/', '_', $qr_value);
    $filename = $uploaddir . $safe . '.png';
    $image_path = 'uploads/qr/' . $safe . '.png';
    $stmt = $pdo->prepare("INSERT INTO qr(qr_code,location_id,image_path) VALUES(?,?,?)");
    $stmt->execute([$qr_value, $loc_id, $image_path]);
    $qr_id = $pdo->lastInsertId();
    try {
        require_once __DIR__ . '/phpqrcode/qrlib.php';
        QRcode::png($qr_value, $filename, QR_ECLEVEL_L, 5);
    } catch (\Throwable $e) {
        // Image generation failed, clear the path from DB
        $pdo->prepare("UPDATE qr SET image_path=NULL WHERE qr_id=?")->execute([$qr_id]);
        echo json_encode(['success'=>false,'message'=>'QR saved but image generation failed','qr_id'=>$qr_id,'qr_code'=>$qr_value,'image_path'=>null]);
        exit;
    }
    echo json_encode(['success'=>true,'message'=>'QR generated','qr_id'=>$qr_id,'qr_code'=>$qr_value,'image_path'=>$image_path]);
    exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
