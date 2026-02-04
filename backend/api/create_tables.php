<?php
require 'config.php';
header('Content-Type: application/json');

$sqls = [
    "CREATE TABLE IF NOT EXISTS `user_visit` (
      `visit_id` int(11) NOT NULL AUTO_INCREMENT,
      `user_id` int(11) NOT NULL,
      `location_id` int(11) DEFAULT NULL,
      `qr_id` int(11) DEFAULT NULL,
      `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (`visit_id`),
      UNIQUE KEY `unique_user_location` (`user_id`, `location_id`),
      KEY `user_id` (`user_id`),
      KEY `location_id` (`location_id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci",
    
    "CREATE INDEX idx_user_visit_user ON user_visit(user_id)",
    "CREATE INDEX idx_user_visit_location ON user_visit(location_id)"
];

$results = [];
foreach ($sqls as $sql) {
    try {
        $pdo->exec($sql);
        $results[] = ['status' => 'success', 'sql' => substr($sql, 0, 50) . '...'];
    } catch (\Throwable $e) {
        if (strpos($e->getMessage(), 'already exists') !== false) {
            $results[] = ['status' => 'exists', 'sql' => substr($sql, 0, 50) . '...'];
        } else {
            $results[] = ['status' => 'error', 'sql' => substr($sql, 0, 50) . '...', 'error' => $e->getMessage()];
        }
    }
}

// Verify table was created
try {
    $check = $pdo->query("SELECT COUNT(*) FROM user_visit");
    $results[] = ['verification' => 'Table user_visit exists and is accessible'];
} catch (\Throwable $e) {
    $results[] = ['verification_error' => $e->getMessage()];
}

echo json_encode(['success' => true, 'results' => $results], JSON_PRETTY_PRINT);
?>
