<?php
require 'config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? 'list';

if ($action !== 'list') {
    echo json_encode(['success' => false, 'message' => 'No action']);
    exit;
}

// Build leaderboard: users with score = visits + badges + hidden items claimed
// user_visit may not exist yet; hidden_item has found_by_user_id
$sql = "
SELECT
  u.user_id,
  u.username,
  (SELECT COUNT(*) FROM user_visit uv WHERE uv.user_id = u.user_id) AS visit_count,
  (SELECT COUNT(*) FROM user_badge ub WHERE ub.user_id = u.user_id) AS badge_count,
  (SELECT COUNT(*) FROM hidden_item hi WHERE hi.found_by_user_id = u.user_id) AS found_count
FROM user u
ORDER BY (visit_count * 2 + badge_count * 5 + found_count * 10) DESC, u.username ASC
LIMIT 100
";

if (!isset($pdo)) {
    echo json_encode(['success' => false, 'error' => 'Database not configured']);
    exit;
}
try {
    $stmt = $pdo->query($sql);
} catch (\Throwable $e) {
    // user_visit table might not exist
    $sql = "
    SELECT
      u.user_id,
      u.username,
      0 AS visit_count,
      (SELECT COUNT(*) FROM user_badge ub WHERE ub.user_id = u.user_id) AS badge_count,
      (SELECT COUNT(*) FROM hidden_item hi WHERE hi.found_by_user_id = u.user_id) AS found_count
    FROM user u
    ORDER BY (badge_count * 5 + found_count * 10) DESC, u.username ASC
    LIMIT 100
    ";
    $stmt = $pdo->query($sql);
}

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as &$r) {
    $r['visit_count'] = (int)($r['visit_count'] ?? 0);
    $r['badge_count'] = (int)($r['badge_count'] ?? 0);
    $r['found_count'] = (int)($r['found_count'] ?? 0);
    $r['score'] = $r['visit_count'] * 2 + $r['badge_count'] * 5 + $r['found_count'] * 10;
}
unset($r);

echo json_encode(['success' => true, 'leaderboard' => $rows]);
