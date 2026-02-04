<?php
session_start();
header("Content-Type: application/json");
require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

$identifier = trim($data['identifier'] ?? '');
$password   = $data['password'] ?? '';

if(!$identifier || !$password){
    echo json_encode(["success"=>false,"error"=>"All fields required"]);
    exit;
}

// Lookup admin by username or email
$stmt = $pdo->prepare("SELECT * FROM admin WHERE username=? OR email=?");
$stmt->execute([$identifier, $identifier]);
$admin = $stmt->fetch();

if($admin && password_verify($password, $admin['password_hash'])){
    $_SESSION['admin_id'] = $admin['admin_id'];
    echo json_encode(["success"=>true, "username"=>$admin['username']]);
} else {
    echo json_encode(["success"=>false, "error"=>"Invalid credentials"]);
}
