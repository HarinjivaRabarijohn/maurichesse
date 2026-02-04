<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='list'){
    $stmt = $pdo->query("SELECT * FROM trails ORDER BY trail_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$data = json_decode(file_get_contents("php://input"), true) ?? [];
$id = $data['trail_id'] ?? null;

if($action==='add'){
    $stmt = $pdo->prepare("INSERT INTO trails(trail_name,description,start_lat,start_lng,end_lat,end_lng) VALUES(?,?,?,?,?,?)");
    $stmt->execute([
        $data['trail_name']??'',
        $data['description']??null,
        $data['start_lat']??0,
        $data['start_lng']??0,
        $data['end_lat']??0,
        $data['end_lng']??0
    ]);
    echo json_encode(['success'=>true,'message'=>'Trail added']); exit;
}

if($action==='update'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'trail_id required']); exit; }
    $stmt = $pdo->prepare("UPDATE trails SET trail_name=?, description=?, start_lat=?, start_lng=?, end_lat=?, end_lng=? WHERE trail_id=?");
    $stmt->execute([
        $data['trail_name']??'',
        $data['description']??null,
        $data['start_lat']??0,
        $data['start_lng']??0,
        $data['end_lat']??0,
        $data['end_lng']??0,
        $id
    ]);
    echo json_encode(['success'=>true,'message'=>'Trail updated']); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'trail_id required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM trails WHERE trail_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Trail deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
