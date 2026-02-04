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

// Lookup user by username or email
$stmt = $pdo->prepare("SELECT * FROM user WHERE username=? OR email=?");
$stmt->execute([$identifier, $identifier]);
$user = $stmt->fetch();

if($user && password_verify($password, $user['password_hash'])){
    $_SESSION['user_id'] = $user['user_id'];
    echo json_encode(["success"=>true, "username"=>$user['username']]);
} else {
    echo json_encode(["success"=>false, "error"=>"Invalid credentials"]);
}
