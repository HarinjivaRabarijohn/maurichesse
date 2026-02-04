<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query("SELECT g.*, l.name AS location_name FROM gallery g LEFT JOIN location l ON g.location_id=l.location_id ORDER BY g.gallery_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Accept JSON or multipart/form-data
$raw = file_get_contents("php://input");
$data = $raw ? json_decode($raw, true) : null;
if(empty($data) && !empty($_POST)){
    $data = array_map(function($v){ return is_string($v) ? trim($v) : $v; }, $_POST);
}
$id = $data['gallery_id'] ?? $data['id'] ?? null;

if($action==='add'){
    $imagePath = null;
    if(!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
        $uploaddir = __DIR__ . '/../uploads/gallery/';
        if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'gal_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . ($ext?:'jpg');
        $dest = $uploaddir . $filename;
        if(move_uploaded_file($_FILES['image']['tmp_name'], $dest)){
            $imagePath = 'uploads/gallery/' . $filename;
        }
    } else {
        $imagePath = $data['image_path'] ?? $data['image'] ?? null;
    }

    $location_id = isset($data['location_id']) && $data['location_id'] !== '' ? (int)$data['location_id'] : null;
    $caption = $data['caption'] ?? null;

    $stmt = $pdo->prepare("INSERT INTO gallery(location_id,image_path,caption) VALUES(?,?,?)");
    $stmt->execute([$location_id,$imagePath,$caption]);
    $newId = $pdo->lastInsertId();
    $row = $pdo->query("SELECT g.*, l.name AS location_name FROM gallery g LEFT JOIN location l ON g.location_id=l.location_id WHERE g.gallery_id=".(int)$newId)->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'message'=>'Gallery added','data'=>$row]); exit;
}

if($action==='update'){
    $imagePath = null;
    if(!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
        $uploaddir = __DIR__ . '/../uploads/gallery/';
        if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'gal_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . ($ext?:'jpg');
        $dest = $uploaddir . $filename;
        if(move_uploaded_file($_FILES['image']['tmp_name'], $dest)){
            $imagePath = 'uploads/gallery/' . $filename;
        }
    } else {
        $imagePath = $data['image_path'] ?? $data['image'] ?? null;
    }

    $location_id = isset($data['location_id']) && $data['location_id'] !== '' ? (int)$data['location_id'] : null;
    $caption = $data['caption'] ?? null;

    $stmt = $pdo->prepare("UPDATE gallery SET location_id=?, image_path=?, caption=? WHERE gallery_id=?");
    $stmt->execute([$location_id,$imagePath,$caption,$id]);
    $row = $pdo->query("SELECT g.*, l.name AS location_name FROM gallery g LEFT JOIN location l ON g.location_id=l.location_id WHERE g.gallery_id=".(int)$id)->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'message'=>'Gallery updated','data'=>$row]); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM gallery WHERE gallery_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Gallery deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
