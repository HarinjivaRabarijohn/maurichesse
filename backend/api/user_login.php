<?php
session_start();
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
    echo json_encode([
        "success"=>true,
        "username"=>$user['username'],
        "user_id"=>$user['user_id'],
        "email"=>$user['email'] ?? ''
    ]);
} else {
    echo json_encode(["success"=>false, "error"=>"Invalid credentials"]);
}
