<?php
// ==========================================================
// NextOlymp — Users API
// ==========================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT `id`, `email`, `phone`, `fullName`, `role`, `gender`, `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt` FROM `users` ORDER BY `createdAt` DESC");
    $users = $stmt->fetchAll();

    foreach ($users as &$u) {
        $u['grade'] = $u['grade'] !== null ? (int)$u['grade'] : null;
        $u['parentConsent'] = (bool)$u['parentConsent'];
    }

    echo json_encode(['status' => 'success', 'data' => $users]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (empty($data['email']) || empty($data['fullName'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing email or fullName']);
        exit;
    }

    $id = $data['id'] ?? ('usr_' . time() . '_' . rand(100, 999));
    $email = trim($data['email']);
    $phone = $data['phone'] ?? null;
    $fullName = trim($data['fullName']);
    $role = $data['role'] ?? 'student';
    $gender = $data['gender'] ?? 'male';
    $grade = isset($data['grade']) ? (int)$data['grade'] : null;
    $region = $data['region'] ?? null;
    $district = $data['district'] ?? null;
    $school = $data['school'] ?? null;
    $avatarUrl = $data['avatarUrl'] ?? null;
    $parentConsent = !empty($data['parentConsent']) ? 1 : 1;
    $createdAt = $data['createdAt'] ?? date('Y-m-d H:i:s');

    $sql = "INSERT INTO `users` (
        `id`, `email`, `phone`, `fullName`, `role`, `gender`,
        `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt`
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE
        `phone` = VALUES(`phone`),
        `fullName` = VALUES(`fullName`),
        `role` = VALUES(`role`),
        `gender` = VALUES(`gender`),
        `grade` = VALUES(`grade`),
        `region` = VALUES(`region`),
        `district` = VALUES(`district`),
        `school` = VALUES(`school`),
        `avatarUrl` = VALUES(`avatarUrl`);";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id, $email, $phone, $fullName, $role, $gender,
        $grade, $region, $district, $school, $avatarUrl, $parentConsent, $createdAt
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => 'User saved to MySQL',
        'user' => [
            'id' => $id,
            'email' => $email,
            'phone' => $phone,
            'fullName' => $fullName,
            'role' => $role,
            'gender' => $gender,
            'grade' => $grade,
            'region' => $region,
            'district' => $district,
            'school' => $school,
            'avatarUrl' => $avatarUrl,
            'parentConsent' => (bool)$parentConsent,
            'createdAt' => $createdAt
        ]
    ]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'User ID is required']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM `users` WHERE `id` = ?");
    $stmt->execute([$id]);

    // Also remove any submissions associated with this user
    $subDel = $pdo->prepare("DELETE FROM `submissions` WHERE `userId` = ?");
    $subDel->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => 'User deleted from MySQL']);
    exit;
}
