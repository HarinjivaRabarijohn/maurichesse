<?php
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

$username = trim($data['username'] ?? '');
$email    = trim($data['email'] ?? '');
$password = $data['password'] ?? '';

if(!$username || !$email || !$password){
    echo json_encode(["success"=>false,"error"=>"All fields are required"]);
    exit;
}

// Check for duplicate username or email
$stmt = $pdo->prepare("SELECT * FROM user WHERE username=? OR email=?");
$stmt->execute([$username, $email]);
if($stmt->rowCount() > 0){
    echo json_encode(["success"=>false,"error"=>"Username or email already exists"]);
    exit;
}

// Hash password
$pass_hash = password_hash($password, PASSWORD_DEFAULT);

// Insert user
$stmt = $pdo->prepare("INSERT INTO user (username, email, password_hash) VALUES (?, ?, ?)");
$stmt->execute([$username, $email, $pass_hash]);

// Get the inserted user ID
$user_id = $pdo->lastInsertId();

echo json_encode(["success"=>true, "user_id"=>$user_id]);
