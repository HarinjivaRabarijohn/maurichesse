<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query(
        "SELECT l.*, c.category_name 
         FROM location l
         LEFT JOIN category c ON l.category_id=c.category_id
         ORDER BY l.location_id DESC"
    );
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

// Accept JSON (php://input) OR multipart/form-data (use $_POST)
$raw = file_get_contents("php://input");
$data = $raw ? json_decode($raw, true) : null;
if(empty($data) && !empty($_POST)){
    // normalize $_POST (all values are strings)
    $data = array_map(function($v){ return is_string($v) ? trim($v) : $v; }, $_POST);
}

$id = $data['location_id'] ?? $data['id'] ?? null;

if($action==='add'){
    // allow multipart uploads (image) or JSON body with image url
    $imagePath = null;
    if(!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
        $uploaddir = __DIR__ . '/../uploads/locations/';
        if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'loc_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . ($ext?:'jpg');
        $dest = $uploaddir . $filename;
        if(move_uploaded_file($_FILES['image']['tmp_name'], $dest)){
            $imagePath = 'uploads/locations/' . $filename;
        }
    } else {
        $imagePath = $data['image'] ?? $data['image_path'] ?? null;
    }

    // prefer values from $data (which may come from $_POST)
    $name = $data['name'] ?? '';
    $description = $data['description'] ?? null;
    $history = $data['history'] ?? null;
    $latitude = isset($data['latitude']) ? (float)$data['latitude'] : 0.0;
    $longitude = isset($data['longitude']) ? (float)$data['longitude'] : 0.0;
    $address = $data['address'] ?? null;
    $category_id = isset($data['category_id']) && $data['category_id'] !== '' ? (int)$data['category_id'] : null;

    $stmt = $pdo->prepare(
        "INSERT INTO location(name,description,history,image,latitude,longitude,address,category_id)
         VALUES(?,?,?,?,?,?,?,?)"
    );
    $stmt->execute([
        $name,
        $description,
        $history,
        $imagePath,
        $latitude,
        $longitude,
        $address,
        $category_id
    ]);

    $newId = $pdo->lastInsertId();
    $row = $pdo->query("SELECT * FROM location WHERE location_id=" . (int)$newId)->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'message'=>'Location added','data'=>$row]); exit;
}

if($action==='update'){
    // support file upload or JSON update
    $imagePath = null;
    if(!empty($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK){
        $uploaddir = __DIR__ . '/../uploads/locations/';
        if(!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
        $ext = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
        $filename = 'loc_' . time() . '_' . bin2hex(random_bytes(6)) . '.' . ($ext?:'jpg');
        $dest = $uploaddir . $filename;
        if(move_uploaded_file($_FILES['image']['tmp_name'], $dest)){
            $imagePath = 'uploads/locations/' . $filename;
        }
    } else {
        $imagePath = $data['image'] ?? $data['image_path'] ?? null;
    }

    $name = $data['name'] ?? '';
    $description = $data['description'] ?? null;
    $history = $data['history'] ?? null;
    $latitude = isset($data['latitude']) ? (float)$data['latitude'] : 0.0;
    $longitude = isset($data['longitude']) ? (float)$data['longitude'] : 0.0;
    $address = $data['address'] ?? null;
    $category_id = isset($data['category_id']) && $data['category_id'] !== '' ? (int)$data['category_id'] : null;

    $stmt = $pdo->prepare(
        "UPDATE location SET name=?, description=?, history=?, image=?, latitude=?, longitude=?, address=?, category_id=? WHERE location_id=?"
    );
    $stmt->execute([
        $name,
        $description,
        $history,
        $imagePath,
        $latitude,
        $longitude,
        $address,
        $category_id,
        $id
    ]);

    $row = $pdo->query("SELECT * FROM location WHERE location_id=" . (int)$id)->fetch(PDO::FETCH_ASSOC);
    echo json_encode(['success'=>true,'message'=>'Location updated','data'=>$row]); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM location WHERE location_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Location deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
