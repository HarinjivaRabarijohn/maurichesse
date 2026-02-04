<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

echo json_encode([
    "php_version" => phpversion(),
    "server" => $_SERVER['HTTP_HOST'],
    "pdo_drivers" => PDO::getAvailableDrivers()
]);

// Test database connection
$host = 'your_mysql_host_here';  // Replace with InfinityFree hostname
$db = 'your_db_name_here';        // Replace with your database name
$user = 'your_db_user_here';      // Replace with your database username
$pass = 'your_password_here';     // Replace with your password
$port = 3306;

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$db", $user, $pass);
    echo json_encode(["success" => true, "message" => "Database connected!"]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
