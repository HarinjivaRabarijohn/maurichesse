<?php
// Auto-setup database tables for PostgreSQL
require_once '../config.php';

try {
    // Check if tables exist
    $stmt = $pdo->query("SELECT to_regclass('public.admin')");
    $exists = $stmt->fetchColumn();
    
    if (!$exists) {
        // Read and execute schema
        $schema = file_get_contents(__DIR__ . '/../db/mauheritage_postgres.sql');
        $pdo->exec($schema);
        echo json_encode(["success" => true, "message" => "Database tables created successfully"]);
    } else {
        echo json_encode(["success" => true, "message" => "Database already initialized"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
?>
