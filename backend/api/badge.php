<?php
require 'config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query("SELECT * FROM badge ORDER BY badge_id ASC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

if($action==='user_badges'){
    $user_id = (int)($_GET['user_id'] ?? 0);
    if(!$user_id){
        echo json_encode([]);
        exit;
    }
    $stmt = $pdo->prepare("SELECT b.*, ub.earned_at FROM badge b INNER JOIN user_badge ub ON b.badge_id=ub.badge_id WHERE ub.user_id=? ORDER BY ub.earned_at DESC");
    $stmt->execute([$user_id]);
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$id = $data['badge_id'] ?? null;

if($action==='add'){
    $stmt = $pdo->prepare("INSERT INTO badge(name,description,image_path,criteria_type) VALUES(?,?,?,?)");
    $stmt->execute([
        $data['name']??'',
        $data['description']??null,
        $data['image_path']??null,
        $data['criteria_type']??null
    ]);
    echo json_encode(['success'=>true,'message'=>'Badge added']); exit;
}

if($action==='update'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'badge_id required']); exit; }
    $stmt = $pdo->prepare("UPDATE badge SET name=?, description=?, image_path=?, criteria_type=? WHERE badge_id=?");
    $stmt->execute([
        $data['name']??'',
        $data['description']??null,
        $data['image_path']??null,
        $data['criteria_type']??null,
        $id
    ]);
    echo json_encode(['success'=>true,'message'=>'Badge updated']); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'badge_id required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM badge WHERE badge_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Badge deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
