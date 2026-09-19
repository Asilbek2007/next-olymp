<?php
// ==========================================================
// NextOlymp — Cybersecurity & Anti-Cheat API
// Fayl: api/security.php
// ==========================================================

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['user_id'] ?? null;
    $limit = (int)($_GET['limit'] ?? 50);

    if ($userId) {
        $stmt = $pdo->prepare("SELECT * FROM security_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$userId, $limit]);
    } else {
        $stmt = $pdo->prepare("SELECT * FROM security_logs ORDER BY created_at DESC LIMIT ?");
        $stmt->execute([$limit]);
    }

    $logs = $stmt->fetchAll();

    // Summary statistics for admin security graphs
    $statStmt = $pdo->query("SELECT event_type, COUNT(*) as count FROM security_logs GROUP BY event_type");
    $stats = $statStmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'total' => count($logs),
        'stats' => $stats,
        'data' => $logs
    ]);
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

    $id = $data['id'] ?? ('sec_' . time() . '_' . rand(100, 999));
    $userId = $data['user_id'] ?? ($data['studentId'] ?? null);
    $ipAddress = $_SERVER['REMOTE_ADDR'] ?? ($data['ip_address'] ?? '127.0.0.1');
    $eventType = $data['event_type'] ?? ($data['type'] ?? 'tab_switch');
    $details = $data['details'] ?? ($data['message'] ?? '');
    $severity = $data['severity'] ?? 'medium';

    $sql = "INSERT INTO security_logs (id, user_id, ip_address, event_type, details, severity) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$id, $userId, $ipAddress, $eventType, $details, $severity]);

    echo json_encode([
        'status' => 'success',
        'message' => 'Xavfsizlik hodisasi MySQL bazasiga saqlandi',
        'id' => $id
    ]);
    exit;
}
