<?php
require 'config.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$data = json_decode(file_get_contents("php://input"), true) ?? [];
if (empty($data) && !empty($_POST)) $data = $_POST;

if ($action === 'record') {
    $user_id = (int)($data['user_id'] ?? 0);
    $location_id = (int)($data['location_id'] ?? 0);
    $qr_id = (int)($data['qr_id'] ?? 0);
    if (!$user_id || (!$location_id && !$qr_id)) {
        echo json_encode(['success' => false, 'message' => 'user_id and (location_id or qr_id) required']);
        exit;
    }
    try {
        $awarded = 0;
        $alreadyVisited = 0;

        if ($location_id) {
            $check = $pdo->prepare("SELECT COUNT(*) FROM user_visit WHERE user_id = ? AND location_id = ?");
            $check->execute([$user_id, $location_id]);
            $alreadyVisited = (int)$check->fetchColumn();
        } elseif ($qr_id) {
            $check = $pdo->prepare("SELECT COUNT(*) FROM user_visit WHERE user_id = ? AND qr_id = ?");
            $check->execute([$user_id, $qr_id]);
            $alreadyVisited = (int)$check->fetchColumn();
        }

        $stmt = $pdo->prepare("INSERT INTO user_visit (user_id, location_id, qr_id) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $location_id ?: null, $qr_id ?: null]);

        if ($alreadyVisited === 0) {
            try {
                $stmt = $pdo->prepare("INSERT INTO user_points (user_id, points, reason, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)");
                $stmt->execute([$user_id, 10, 'QR scan', 'user_visit', $location_id ?: $qr_id]);
                $awarded = 10;
            } catch (\Throwable $e) {
                // user_points table may not exist
            }
        }

        echo json_encode(['success' => true, 'message' => 'Visit recorded', 'awarded_points' => $awarded]);
    } catch (\Throwable $e) {
        echo json_encode(['success' => false, 'message' => 'Could not record visit (table may not exist)']);
    }
    exit;
}

if ($action === 'upload_photo') {
    $user_id = (int)($data['user_id'] ?? 0);
    $location_id = (int)($data['location_id'] ?? 0);
    if (!$user_id || !$location_id) {
        echo json_encode(['success' => false, 'message' => 'user_id and location_id required']);
        exit;
    }
    
    if (!isset($_FILES['photo'])) {
        echo json_encode(['success' => false, 'message' => 'Photo file required']);
        exit;
    }
    
    $file = $_FILES['photo'];
    $uploaddir = __DIR__ . '/../uploads/visits/';
    if (!is_dir($uploaddir)) @mkdir($uploaddir, 0755, true);
    
    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg', 'jpeg', 'png', 'gif'])) {
        echo json_encode(['success' => false, 'message' => 'Invalid image format']);
        exit;
    }
    
    $filename = 'visit_' . $user_id . '_' . $location_id . '_' . time() . '.' . $ext;
    $filepath = $uploaddir . $filename;
    
    if (move_uploaded_file($file['tmp_name'], $filepath)) {
        try {
            $stmt = $pdo->prepare("INSERT INTO visit_photo (user_id, location_id, image_path, verified) VALUES (?, ?, ?, 0)");
            $stmt->execute([$user_id, $location_id, 'uploads/visits/' . $filename]);
            echo json_encode(['success' => true, 'message' => 'Photo uploaded. Awaiting admin verification.']);
        } catch (\Throwable $e) {
            echo json_encode(['success' => false, 'message' => 'Could not save photo record: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'File upload failed']);
    }
    exit;
}

if ($action === 'list_pending') {
    try {
        $stmt = $pdo->query("
            SELECT vp.*, u.username, l.name as location_name 
            FROM visit_photo vp 
            LEFT JOIN user u ON vp.user_id = u.user_id 
            LEFT JOIN location l ON vp.location_id = l.location_id 
            WHERE vp.verified = 0 
            ORDER BY vp.created_at DESC
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    } catch (\Throwable $e) {
        echo json_encode([]);
    }
    exit;
}

if ($action === 'approve_photo') {
    $photo_id = (int)($data['photo_id'] ?? 0);
    $user_id = (int)($data['user_id'] ?? 0);
    $points = (int)($data['points'] ?? 10);
    
    if (!$photo_id || !$user_id) {
        echo json_encode(['success' => false, 'message' => 'photo_id and user_id required']);
        exit;
    }
    
    try {
        $pdo->beginTransaction();
        
        // Mark photo as verified
        $stmt = $pdo->prepare("UPDATE visit_photo SET verified = 1, verified_at = NOW() WHERE photo_id = ?");
        $stmt->execute([$photo_id]);
        
        // Award points
        $stmt = $pdo->prepare("INSERT INTO user_points (user_id, points, reason, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)");
        $stmt->execute([$user_id, $points, 'Photo verification', 'visit_photo', $photo_id]);
        
        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Photo approved and points awarded']);
    } catch (\Throwable $e) {
        $pdo->rollBack();
        echo json_encode(['success' => false, 'message' => 'Approval failed: ' . $e->getMessage()]);
    }
    exit;
}

if ($action === 'reject_photo') {
    $photo_id = (int)($data['photo_id'] ?? 0);
    
    if (!$photo_id) {
        echo json_encode(['success' => false, 'message' => 'photo_id required']);
        exit;
    }
    
    try {
        // Get image path to delete file
        $stmt = $pdo->prepare("SELECT image_path FROM visit_photo WHERE photo_id = ?");
        $stmt->execute([$photo_id]);
        $photo = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($photo && $photo['image_path']) {
            $filepath = __DIR__ . '/../' . $photo['image_path'];
            if (file_exists($filepath)) {
                @unlink($filepath);
            }
        }
        
        // Delete record
        $stmt = $pdo->prepare("DELETE FROM visit_photo WHERE photo_id = ?");
        $stmt->execute([$photo_id]);
        
        echo json_encode(['success' => true, 'message' => 'Photo rejected and deleted']);
    } catch (\Throwable $e) {
        echo json_encode(['success' => false, 'message' => 'Rejection failed: ' . $e->getMessage()]);
    }
    exit;
}

if ($action === 'user_visited') {
    $user_id = (int)($data['user_id'] ?? $_GET['user_id'] ?? 0);
    if (!$user_id) {
        echo json_encode(['success' => false, 'message' => 'user_id required', 'visited' => []]);
        exit;
    }

    try {
        $stmt = $pdo->prepare("
            SELECT
                l.location_id,
                l.name AS location_name,
                l.latitude,
                l.longitude,
                MIN(uv.created_at) AS first_visit,
                (
                    (SELECT COUNT(*) FROM user_visit uv2 WHERE uv2.user_id = ? AND uv2.location_id = l.location_id) * 10
                ) + (
                    (SELECT COUNT(*) FROM visit_photo vp WHERE vp.user_id = ? AND vp.location_id = l.location_id AND vp.verified = 1) * 10
                ) AS total_points
            FROM user_visit uv
            LEFT JOIN location l ON uv.location_id = l.location_id
            WHERE uv.user_id = ?
            GROUP BY l.location_id
            ORDER BY MIN(uv.created_at) DESC
        ");
        $stmt->execute([$user_id, $user_id, $user_id]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'visited' => $rows]);
    } catch (\Throwable $e) {
        echo json_encode(['success' => false, 'message' => 'Could not load visited locations', 'visited' => []]);
    }
    exit;
}

echo json_encode(['success' => false, 'message' => 'No action']);
