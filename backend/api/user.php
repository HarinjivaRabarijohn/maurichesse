<?php
require 'config.php';
$action = $_GET['action'] ?? '';

if($action==='get_points'){
    $user_id = (int)($_GET['user_id'] ?? 0);
    if(!$user_id){
        echo json_encode(['success'=>false,'points'=>0]);
        exit;
    }
    try{
        $stmt = $pdo->prepare("SELECT COALESCE(SUM(points), 0) as total_points FROM user_points WHERE user_id=?");
        $stmt->execute([$user_id]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['success'=>true,'points'=>(int)$result['total_points']]);
    }catch(\Throwable $e){
        echo json_encode(['success'=>false,'points'=>0,'message'=>'Table may not exist']);
    }
    exit;
}

if($action==='list'){
    try {
        $stmt = $pdo->query("SELECT u.user_id, u.username, u.email, u.created_at, COALESCE(SUM(up.points), 0) AS total_points FROM user u LEFT JOIN user_points up ON u.user_id = up.user_id GROUP BY u.user_id, u.username, u.email, u.created_at ORDER BY u.user_id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (\Throwable $e) {
        $stmt = $pdo->query("SELECT user_id, username, email, created_at, 0 AS total_points FROM user ORDER BY user_id DESC");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    }
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if($action==='add'){
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? '';

    if(!$username || !$password || !$email){
        echo json_encode(['success'=>false,'message'=>'Username, email and password required']);
        exit;
    }

    $hash = password_hash($password,PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO user(username,email,password_hash) VALUES(?,?,?)");
    $stmt->execute([$username,$email,$hash]);

    echo json_encode(['success'=>true,'message'=>'User added']); exit;
}

if($action==='update'){
    $id = $data['user_id'] ?? '';
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? '';
    $password = $data['password'] ?? null;

    if(!$id || !$username || !$email){
        echo json_encode(['success'=>false,'message'=>'ID, username, and email required']);
        exit;
    }

    if($password){
        $hash = password_hash($password,PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE user SET username=?, email=?, password_hash=? WHERE user_id=?");
        $stmt->execute([$username,$email,$hash,$id]);
    } else {
        $stmt = $pdo->prepare("UPDATE user SET username=?, email=? WHERE user_id=?");
        $stmt->execute([$username,$email,$id]);
    }

    echo json_encode(['success'=>true,'message'=>'User updated']); exit;
}

if($action==='delete'){
    $id = $data['user_id'] ?? '';
    if(!$id){ echo json_encode(['success'=>false,'message'=>'ID required']); exit; }
    $stmt = $pdo->prepare("DELETE FROM user WHERE user_id=?");
    $stmt->execute([$id]);
    echo json_encode(['success'=>true,'message'=>'User deleted']); exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
