<?php
// ==========================================================
// NextOlymp — Authentication API (api/auth.php)
// Login, Register, Profile info using MySQL
// ==========================================================

require_once __DIR__ . '/db.php';

$action = $_GET['action'] ?? ($_POST['action'] ?? '');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return profile by ID or token
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("SELECT id, full_name, fullName, phone, email, role, region, district, school, grade, score, created_at, createdAt FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch();
        if ($user) {
            echo json_encode(['status' => 'success', 'user' => $user]);
        } else {
            http_response_code(404);
            echo json_encode(['status' => 'error', 'message' => 'Foydalanuvchi topilmadi']);
        }
    } else {
        echo json_encode(['status' => 'success', 'message' => 'Auth API faol']);
    }
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true) ?? $_POST;
    $action = $data['action'] ?? $action;

    // ─────────────────────────────────────────────────────────
    // 1. REGISTER USER
    // ─────────────────────────────────────────────────────────
    if ($action === 'register') {
        $email = trim($data['email'] ?? '');
        $fullName = trim($data['fullName'] ?? ($data['full_name'] ?? ''));
        $password = trim($data['password'] ?? 'password123');
        $phone = trim($data['phone'] ?? '');
        $role = $data['role'] ?? 'student';
        $grade = isset($data['grade']) ? (int)$data['grade'] : 9;
        $region = $data['region'] ?? 'Toshkent shahri';
        $district = $data['district'] ?? '';
        $school = $data['school'] ?? 'Maktab';
        $createdAt = date('Y-m-d H:i:s');
        $id = $data['id'] ?? ('usr_' . time() . '_' . rand(100, 999));

        if (empty($email) || empty($fullName)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email va to\'liq ism kiritilishi shart!']);
            exit;
        }

        // Check duplicate email or phone
        $checkStmt = $pdo->prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?) OR (phone != '' AND phone = ?)");
        $checkStmt->execute([$email, $phone]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => "Ushbu elektron pochta yoki telefon bilan allaqachon hisob mavjud!"]);
            exit;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';

        $insertSql = "INSERT INTO users (
            id, full_name, fullName, phone, email, password_hash, password,
            role, grade, region, district, school, avatar_url, avatarUrl, created_at, createdAt
        ) VALUES (
            ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
        )";

        $stmt = $pdo->prepare($insertSql);
        $stmt->execute([
            $id, $fullName, $fullName, $phone, $email, $passwordHash, $password,
            $role, $grade, $region, $district, $school, $avatarUrl, $avatarUrl, $createdAt, $createdAt
        ]);

        $token = 'jwt_' . md5($id . time()) . '_' . bin2hex(random_bytes(16));

        echo json_encode([
            'status' => 'success',
            'message' => 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz!',
            'token' => $token,
            'user' => [
                'id' => $id,
                'email' => $email,
                'phone' => $phone,
                'fullName' => $fullName,
                'full_name' => $fullName,
                'role' => $role,
                'grade' => $grade,
                'region' => $region,
                'district' => $district,
                'school' => $school,
                'avatarUrl' => $avatarUrl,
                'createdAt' => $createdAt
            ]
        ]);
        exit;
    }

    // ─────────────────────────────────────────────────────────
    // 2. LOGIN USER
    // ─────────────────────────────────────────────────────────
    if ($action === 'login') {
        $emailOrPhone = trim($data['email'] ?? ($data['phone'] ?? ''));
        $password = trim($data['password'] ?? '');

        if (empty($emailOrPhone) || empty($password)) {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Email/Telefon va parol kiritilishi shart!']);
            exit;
        }

        $stmt = $pdo->prepare("SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phone = ? LIMIT 1");
        $stmt->execute([$emailOrPhone, $emailOrPhone]);
        $user = $stmt->fetch();

        if (!$user) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Bunday foydalanuvchi topilmadi!']);
            exit;
        }

        // Verify password
        $passMatch = false;
        if (!empty($user['password_hash']) && password_verify($password, $user['password_hash'])) {
            $passMatch = true;
        } elseif (!empty($user['password']) && $user['password'] === $password) {
            $passMatch = true;
        }

        if (!$passMatch) {
            http_response_code(401);
            echo json_encode(['status' => 'error', 'message' => 'Kiritilgan parol noto\'g\'ri!']);
            exit;
        }

        $token = 'jwt_' . md5($user['id'] . time()) . '_' . bin2hex(random_bytes(16));

        echo json_encode([
            'status' => 'success',
            'message' => 'Tizimga muvaffaqiyatli kirdingiz!',
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'phone' => $user['phone'],
                'fullName' => $user['full_name'] ?? $user['fullName'],
                'role' => $user['role'],
                'grade' => (int)($user['grade'] ?? 9),
                'region' => $user['region'],
                'district' => $user['district'],
                'school' => $user['school'],
                'score' => (int)($user['score'] ?? 0),
                'avatarUrl' => $user['avatar_url'] ?? $user['avatarUrl']
            ]
        ]);
        exit;
    }

    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Noma\'lum action']);
    exit;
}
