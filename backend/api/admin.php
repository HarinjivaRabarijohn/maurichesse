<?php
require 'config.php';

$action = $_GET['action'] ?? '';

if($action === 'list'){
    $stmt = $pdo->query("SELECT admin_id, username, IFNULL(email,'') AS email, created_at FROM admin ORDER BY admin_id DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if($action === 'add'){
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? '';

    if(!$username || !$password){
        echo json_encode(['success'=>false,'message'=>'Username and password required']);
        exit;
    }

    $password_hash = password_hash($password, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO admin(username,email,password_hash) VALUES(?,?,?)");
    $stmt->execute([$username,$email,$password_hash]);

    echo json_encode(['success'=>true,'message'=>'Admin added']);
    exit;
}

if($action === 'update'){
    $admin_id = $data['admin_id'] ?? '';
    $username = $data['username'] ?? '';
    $email = $data['email'] ?? null;
    $password = $data['password'] ?? null;

    if(!$admin_id || !$username){
        echo json_encode(['success'=>false,'message'=>'ID and username required']);
        exit;
    }

    if($password){
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("UPDATE admin SET username=?, email=?, password_hash=? WHERE admin_id=?");
        $stmt->execute([$username,$email,$hash,$admin_id]);
    } else {
        $stmt = $pdo->prepare("UPDATE admin SET username=?, email=? WHERE admin_id=?");
        $stmt->execute([$username,$email,$admin_id]);
    }

    echo json_encode(['success'=>true,'message'=>'Admin updated']);
    exit;
}

if($action === 'delete'){
    $admin_id = $data['admin_id'] ?? '';
    if(!$admin_id){
        echo json_encode(['success'=>false,'message'=>'ID required']);
        exit;
    }
    $stmt = $pdo->prepare("DELETE FROM admin WHERE admin_id=?");
    $stmt->execute([$admin_id]);
    echo json_encode(['success'=>true,'message'=>'Admin deleted']);
    exit;
}

if($action === 'login'){
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM admin WHERE username=?");
    $stmt->execute([$username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    if($admin && password_verify($password,$admin['password_hash'])){
        unset($admin['password_hash']);
        echo json_encode(['success'=>true,'message'=>'Login successful','admin'=>$admin]);
    } else {
        echo json_encode(['success'=>false,'message'=>'Invalid credentials']);
    }
    exit;
}

echo json_encode(['success'=>false,'message'=>'No action specified']);
?>
