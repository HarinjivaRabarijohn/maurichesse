<?php
require 'config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query("SELECT h.*, l.name AS location_name FROM hidden_item h LEFT JOIN location l ON h.location_id=l.location_id ORDER BY h.item_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$id = $data['item_id'] ?? null;

if($action==='add'){
    $stmt = $pdo->prepare("INSERT INTO hidden_item(location_id,name,description,latitude,longitude) VALUES(?,?,?,?,?)");
    $stmt->execute([
        $data['location_id']??null,
        $data['name']??'',
        $data['description']??null,
        $data['latitude']??0,
        $data['longitude']??0
    ]);
    echo json_encode(['success'=>true,'message'=>'Hidden item added']); exit;
}

if($action==='update'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'item_id required']); exit; }
    $stmt = $pdo->prepare("UPDATE hidden_item SET location_id=?, name=?, description=?, latitude=?, longitude=? WHERE item_id=?");
    $stmt->execute([
        $data['location_id']??null,
        $data['name']??'',
        $data['description']??null,
        $data['latitude']??0,
        $data['longitude']??0,
        $id
    ]);
    echo json_encode(['success'=>true,'message'=>'Hidden item updated']); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'item_id required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM hidden_item WHERE item_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Hidden item deleted']); exit;
}

// Claim: user within proximity (e.g. 150m) can claim; first finder wins; optional photo proof
if($action==='claim'){
    $item_id = (int)($data['item_id'] ?? $_POST['item_id'] ?? $_GET['item_id'] ?? 0);
    $user_id = (int)($data['user_id'] ?? $_POST['user_id'] ?? 0);
    $lat = (float)($data['latitude'] ?? $_POST['latitude'] ?? $data['lat'] ?? 0);
    $lng = (float)($data['longitude'] ?? $_POST['longitude'] ?? $data['lng'] ?? 0);
    if(!$item_id){ echo json_encode(['success'=>false,'message'=>'item_id required']); exit; }

    $stmt = $pdo->prepare("SELECT * FROM hidden_item WHERE item_id=?");
    $stmt->execute([$item_id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);
    if(!$item){
        echo json_encode(['success'=>false,'message'=>'Item not found']); exit;
    }
    if($item['found_by_user_id']){
        echo json_encode(['success'=>false,'message'=>'Already claimed by another user','already_claimed'=>true]); exit;
    }

    $itemLat = (float)$item['latitude'];
    $itemLng = (float)$item['longitude'];
    $dist = sqrt(pow($itemLat - $lat, 2) + pow($itemLng - $lng, 2)) * 111000; // rough metres
    $proximity_metres = 150;
    if($dist > $proximity_metres){
        echo json_encode(['success'=>false,'message'=>'You must be within '.$proximity_metres.'m to claim','distance_metres'=>round($dist)]); exit;
    }

    $claim_photo_path = null;
    if(!empty($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK){
        $uploaddir = __DIR__ . '/../uploads/claims/';
        if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
        $ext = pathinfo($_FILES['photo']['name'], PATHINFO_EXTENSION) ?: 'jpg';
        $filename = 'claim_' . $item_id . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $ext;
        if(move_uploaded_file($_FILES['photo']['tmp_name'], $uploaddir . $filename)){
            $claim_photo_path = 'uploads/claims/' . $filename;
        }
    }

    try {
        if ($claim_photo_path) {
            $upd = $pdo->prepare("UPDATE hidden_item SET found_by_user_id=?, found_at=NOW(), claim_photo_path=? WHERE item_id=?");
            $upd->execute([$user_id ?: null, $claim_photo_path, $item_id]);
        } else {
            $upd = $pdo->prepare("UPDATE hidden_item SET found_by_user_id=?, found_at=NOW() WHERE item_id=?");
            $upd->execute([$user_id ?: null, $item_id]);
        }
    } catch (\Throwable $e) {
        $upd = $pdo->prepare("UPDATE hidden_item SET found_by_user_id=?, found_at=NOW() WHERE item_id=?");
        $upd->execute([$user_id ?: null, $item_id]);
    }

    $badgeAwarded = false;
    if($user_id){
        try {
            $insBadge = $pdo->prepare("INSERT IGNORE INTO user_badge(user_id, badge_id) VALUES (?, 1)");
            $insBadge->execute([$user_id]);
            $badgeAwarded = $insBadge->rowCount() > 0;
        } catch (\Throwable $e) {}
    }
    echo json_encode(['success'=>true,'message'=>'You found it!','badge_awarded'=>$badgeAwarded]); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
