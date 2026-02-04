<?php
require 'config.php';
header('Content-Type: application/json');

$diagnostics = [];

// Check tables exist
try {
    $tables = ['user', 'user_points', 'user_visit', 'visit_photo', 'location'];
    foreach($tables as $table) {
        try {
            $result = $pdo->query("SELECT COUNT(*) FROM $table");
            $count = $result->fetchColumn();
            $diagnostics[$table] = "OK (rows: $count)";
        } catch (\Throwable $e) {
            $diagnostics[$table] = "ERROR: " . $e->getMessage();
        }
    }
} catch (\Throwable $e) {
    $diagnostics['tables_check'] = "FAILED";
}

// Check user_points for user_id=1
try {
    $stmt = $pdo->prepare("SELECT * FROM user_points WHERE user_id = 1");
    $stmt->execute();
    $points = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $diagnostics['user_1_points'] = $points ?: "NO RECORDS";
} catch (\Throwable $e) {
    $diagnostics['user_1_points_check'] = $e->getMessage();
}

// Check user_visit for user_id=1
try {
    $stmt = $pdo->prepare("SELECT * FROM user_visit WHERE user_id = 1");
    $stmt->execute();
    $visits = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $diagnostics['user_1_visits'] = $visits ?: "NO RECORDS";
} catch (\Throwable $e) {
    $diagnostics['user_1_visits_check'] = $e->getMessage();
}

// Test the query from user.php
try {
    $stmt = $pdo->query("SELECT u.user_id, u.username, u.email, u.created_at, COALESCE(SUM(up.points), 0) AS total_points FROM user u LEFT JOIN user_points up ON u.user_id = up.user_id GROUP BY u.user_id, u.username, u.email, u.created_at ORDER BY u.user_id DESC");
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $diagnostics['user_list_query'] = $results;
} catch (\Throwable $e) {
    $diagnostics['user_list_query_error'] = $e->getMessage();
}

echo json_encode($diagnostics, JSON_PRETTY_PRINT);
?>
