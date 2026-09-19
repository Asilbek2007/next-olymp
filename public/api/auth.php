<?php
// ==========================================================
// NextOlymp — Authentication API (Real MySQL Login & Register)
// ==========================================================

require_once __DIR__ . '/config.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;
    $action = $data['action'] ?? $action;

    // ─────────────────────────────────────────────────────────
    // 1. REGISTER USER (Store permanently in MySQL database)
    // ─────────────────────────────────────────────────────────
    if ($action === 'register') {
        $email = trim($data['email'] ?? '');
        $fullName = trim($data['fullName'] ?? '');
        $password = trim($data['password'] ?? 'password123');
        $phone = trim($data['phone'] ?? '');
        $role = $data['role'] ?? 'student';
        $gender = $data['gender'] ?? 'male';
        $grade = isset($data['grade']) ? (int)$data['grade'] : null;
        $region = $data['region'] ?? 'Toshkent shahri';
        $district = $data['district'] ?? null;
        $school = $data['school'] ?? 'Maktab';
        $parentConsent = !empty($data['parentConsent']) ? 1 : 1;
        $createdAt = date('Y-m-d H:i:s');
        $id = $data['id'] ?? ('usr_' . time() . '_' . rand(100, 999));

        if (empty($email) || empty($fullName)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email va to\'liq ism kiritilishi shart!']);
            exit;
        }

        // Check if email already registered
        $checkStmt = $pdo->prepare("SELECT `id` FROM `users` WHERE LOWER(`email`) = LOWER(?)");
        $checkStmt->execute([$email]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "Ushbu elektron pochta ({$email}) bilan allaqachon hisob ochilgan. Iltimos, tizimga kiring!"]);
            exit;
        }

        // Hash password or store securely
        $avatarUrl = $gender === 'female'
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
            : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        $insertSql = "INSERT INTO `users` (
            `id`, `email`, `phone`, `password`, `fullName`, `role`, `gender`,
            `grade`, `region`, `district`, `school`, `avatarUrl`, `parentConsent`, `createdAt`
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )";

        $stmt = $pdo->prepare($insertSql);
        $stmt->execute([
            $id, $email, $phone, $password, $fullName, $role, $gender,
            $grade, $region, $district, $school, $avatarUrl, $parentConsent, $createdAt
        ]);

        $userPayload = [
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
        ];

        $token = 'jwt_mysql_' . $id . '_' . bin2hex(random_bytes(16));

        echo json_encode([
            'status' => 'success',
            'message' => 'Foydalanuvchi muvaffaqiyatli ro\'yxatdan o\'tdi',
            'user' => $userPayload,
            'token' => $token
        ]);
        exit;
    }

    // ─────────────────────────────────────────────────────────
    // 2. LOGIN USER (Verify from MySQL database)
    // ─────────────────────────────────────────────────────────
    if ($action === 'login') {
        $email = trim($data['email'] ?? '');
        $password = trim($data['password'] ?? '');

        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email va parol kiritilishi shart!']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM `users` WHERE LOWER(`email`) = LOWER(?)");
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Login yoki parol xato! (Foydalanuvchi topilmadi)']);
            exit;
        }

        // Verify password
        if (!empty($user['password']) && $user['password'] !== $password) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Login yoki parol xato!']);
            exit;
        }

        $userPayload = [
            'id' => $user['id'],
            'email' => $user['email'],
            'phone' => $user['phone'],
            'fullName' => $user['fullName'],
            'role' => $user['role'],
            'gender' => $user['gender'],
            'grade' => $user['grade'] !== null ? (int)$user['grade'] : null,
            'region' => $user['region'],
            'district' => $user['district'],
            'school' => $user['school'],
            'avatarUrl' => $user['avatarUrl'],
            'parentConsent' => (bool)$user['parentConsent'],
            'createdAt' => $user['createdAt']
        ];

        $token = 'jwt_mysql_' . $user['id'] . '_' . bin2hex(random_bytes(16));

        echo json_encode([
            'status' => 'success',
            'message' => 'Tizimga muvaffaqiyatli kirildi',
            'user' => $userPayload,
            'token' => $token
        ]);
        exit;
    }
}

// Default response
http_response_code(400);
echo json_encode(['status' => 'error', 'message' => 'Invalid action or request method']);
exit;
