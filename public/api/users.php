<?php
// ==========================================================
// NextOlymp — Users API (api/users.php)
// ==========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("SELECT `id`, `email`, `phone`, `fullName`, `name`, `score`, `role`, `gender`, `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt` FROM `users` WHERE `id` = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if ($user) {
            $user['score'] = (int)($user['score'] ?? 0);
            $user['grade'] = $user['grade'] !== null ? (int)$user['grade'] : null;
            $user['parentConsent'] = (bool)$user['parentConsent'];
            echo json_encode(['status' => 'success', 'data' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Foydalanuvchi topilmadi']);
        }
        exit;
    }

    $stmt = $pdo->query("SELECT `id`, `email`, `phone`, `fullName`, `name`, `score`, `role`, `gender`, `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt` FROM `users` ORDER BY `createdAt` DESC");
    $users = $stmt->fetchAll();

    foreach ($users as &$u) {
        $u['score'] = (int)($u['score'] ?? 0);
        $u['grade'] = $u['grade'] !== null ? (int)$u['grade'] : null;
        $u['parentConsent'] = (bool)$u['parentConsent'];
    }

    echo json_encode($users);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "JSON ma'lumotlar yuborilmadi"]);
        exit;
    }

    // Support simple name & score format
    if (!empty($data['name']) && isset($data['score']) && empty($data['email'])) {
        $name = trim($data['name']);
        $score = (int)$data['score'];
        $id = $data['id'] ?? ('usr_' . time() . '_' . rand(100, 999));
        $email = $data['email'] ?? ($id . '@nextolymp.uz');
        $createdAt = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO `users` (`id`, `fullName`, `name`, `email`, `score`, `createdAt`) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$id, $name, $name, $email, $score, $createdAt]);

        echo json_encode([
            'status' => 'success',
            'id' => $id,
            'message' => "Natija serverdagi bazaga saqlandi"
        ]);
        exit;
    }

    // Support full user profile format
    $fullName = trim($data['fullName'] ?? ($data['name'] ?? ''));
    $email = trim($data['email'] ?? '');

    if (empty($fullName) || empty($email)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "Ma'lumotlar to'liq emas (fullName va email kerak)"]);
        exit;
    }

    $id = $data['id'] ?? ('usr_' . time() . '_' . rand(100, 999));
    $phone = $data['phone'] ?? null;
    $score = (int)($data['score'] ?? 0);
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
        `id`, `email`, `phone`, `fullName`, `name`, `score`, `role`, `gender`,
        `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt`
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE
        `phone` = VALUES(`phone`),
        `fullName` = VALUES(`fullName`),
        `name` = VALUES(`name`),
        `score` = VALUES(`score`),
        `role` = VALUES(`role`),
        `gender` = VALUES(`gender`),
        `grade` = VALUES(`grade`),
        `region` = VALUES(`region`),
        `district` = VALUES(`district`),
        `school` = VALUES(`school`),
        `avatarUrl` = VALUES(`avatarUrl`);";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id, $email, $phone, $fullName, $fullName, $score, $role, $gender,
        $grade, $region, $district, $school, $avatarUrl, $parentConsent, $createdAt
    ]);

    echo json_encode([
        'status' => 'success',
        'message' => "Foydalanuvchi MySQL bazasiga saqlandi",
        'id' => $id,
        'user' => [
            'id' => $id,
            'email' => $email,
            'phone' => $phone,
            'fullName' => $fullName,
            'name' => $fullName,
            'score' => $score,
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
        echo json_encode(['status' => 'error', 'message' => "Foydalanuvchi ID talab qilinadi"]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM `users` WHERE `id` = ?");
    $stmt->execute([$id]);

    $delSub = $pdo->prepare("DELETE FROM `submissions` WHERE `userId` = ?");
    $delSub->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => "Foydalanuvchi MySQL bazasidan o'chirildi"]);
    exit;
}
