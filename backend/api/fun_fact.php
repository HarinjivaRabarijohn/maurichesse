<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='list'){
    try {
        $stmt = $pdo->query("SELECT f.*, q.qr_code FROM fun_fact f LEFT JOIN qr q ON f.qr_id=q.qr_id ORDER BY f.fun_fact_id DESC");
    } catch (\Throwable $e) {
        $stmt = $pdo->query("SELECT f.fun_fact_id, f.qr_id, f.fact_text, f.hint_text, q.qr_code FROM fun_fact f LEFT JOIN qr q ON f.qr_id=q.qr_id ORDER BY f.fun_fact_id DESC");
    }
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($rows as &$r){
        if(!isset($r['hint_text'])) $r['hint_text'] = '';
        if(!isset($r['hint_2'])) $r['hint_2'] = '';
        if(!isset($r['hint_3'])) $r['hint_3'] = '';
    }
    echo json_encode($rows);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);
$id = $data['fun_fact_id'] ?? null;

if($action==='add'){
    try {
        $stmt = $pdo->prepare("INSERT INTO fun_fact(qr_id,fact_text,hint_text,hint_2,hint_3) VALUES(?,?,?,?,?)");
        $stmt->execute([$data['qr_id']??null,$data['fact_text']??'',$data['hint_text']??'',$data['hint_2']??'',$data['hint_3']??'']);
    } catch (\Throwable $e) {
        $stmt = $pdo->prepare("INSERT INTO fun_fact(qr_id,fact_text,hint_text) VALUES(?,?,?)");
        $stmt->execute([$data['qr_id']??null,$data['fact_text']??'',$data['hint_text']??'']);
    }
    echo json_encode(['success'=>true,'message'=>'Riddle added']); exit;
}

if($action==='update'){
    try {
        $stmt = $pdo->prepare("UPDATE fun_fact SET qr_id=?, fact_text=?, hint_text=?, hint_2=?, hint_3=? WHERE fun_fact_id=?");
        $stmt->execute([$data['qr_id']??null,$data['fact_text']??'',$data['hint_text']??'',$data['hint_2']??'',$data['hint_3']??'', $id]);
    } catch (\Throwable $e) {
        $stmt = $pdo->prepare("UPDATE fun_fact SET qr_id=?, fact_text=?, hint_text=? WHERE fun_fact_id=?");
        $stmt->execute([$data['qr_id']??null,$data['fact_text']??'',$data['hint_text']??'', $id]);
    }
    echo json_encode(['success'=>true,'message'=>'Riddle updated']); exit;
}

if($action==='delete'){
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM fun_fact WHERE fun_fact_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Fun fact deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
