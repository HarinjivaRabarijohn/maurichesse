<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Test database connection
try {
    require 'config.php';
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM user");
    $result = $stmt->fetch();
    echo json_encode([
        "success" => true,
        "message" => "API and database working",
        "database" => "mauheritage",
        "total_users" => $result['count'],
        "timestamp" => date('Y-m-d H:i:s')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "message" => "Error: " . $e->getMessage()
    ]);
}
?>
