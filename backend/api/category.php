<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action === 'list'){
    $stmt = $pdo->query("SELECT * FROM category ORDER BY category_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if($action==='add'){
    $name = $data['category_name'] ?? '';
    if(!$name){ echo json_encode(['success'=>false,'message'=>'Category name required']); exit; }
    $stmt = $pdo->prepare("INSERT INTO category(category_name) VALUES(?)");
    $stmt->execute([$name]);
    echo json_encode(['success'=>true,'message'=>'Category added']); exit;
}

if($action==='update'){
    $id = $data['category_id'] ?? '';
    $name = $data['category_name'] ?? '';
    if(!$id || !$name){ echo json_encode(['success'=>false,'message'=>'ID and name required']); exit; }
    $stmt = $pdo->prepare("UPDATE category SET category_name=? WHERE category_id=?");
    $stmt->execute([$name,$id]);
    echo json_encode(['success'=>true,'message'=>'Category updated']); exit;
}

if($action==='delete'){
    $id = $data['category_id'] ?? '';
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM category WHERE category_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'Category deleted']); exit;
}
echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
