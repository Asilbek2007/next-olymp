<?php
// ==========================================================
// NextOlymp — Payments API (Click / Payme / Uzum)
// Fayl: api/payments.php
// ==========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;

    if ($userId) {
        $stmt = $pdo->prepare("SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
    } else {
        $stmt = $pdo->query("SELECT * FROM payments ORDER BY created_at DESC LIMIT 100");
    }

    $payments = $stmt->fetchAll();
    echo json_encode(['status' => 'success', 'data' => $payments]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (!$data || empty($data['user_id']) || empty($data['amount'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => "user_id va amount talab qilinadi"]);
        exit;
    }

    $id = $data['id'] ?? ('pay_' . time() . '_' . rand(100, 999));
    $userId = $data['user_id'];
    $olympiadId = $data['olympiad_id'] ?? 1;
    $amount = (float)$data['amount'];
    $provider = in_array($data['provider'] ?? '', ['click', 'payme', 'uzum']) ? $data['provider'] : 'payme';
    $status = $data['status'] ?? 'paid';
    $transactionId = $data['transaction_id'] ?? ('tx_' . bin2hex(random_bytes(8)));

    $sql = "INSERT INTO payments (id, user_id, olympiad_id, amount, provider, status, transaction_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id, $userId, $olympiadId, $amount, $provider, $status, $transactionId]);

    echo json_encode([
        'status' => 'success',
        'message' => 'To\'lov muvaffaqiyatli qabul qilindi',
        'id' => $id,
        'transaction_id' => $transactionId
    ]);
    exit;
}
