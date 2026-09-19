<?php
// ==========================================================
// NextOlymp — Submissions & Results API
// ==========================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $userId = $_GET['userId'] ?? null;
    $olympiadId = $_GET['olympiadId'] ?? null;

    if ($userId) {
        $stmt = $pdo->prepare("SELECT * FROM `submissions` WHERE `userId` = ? ORDER BY `completedAt` DESC");
        $stmt->execute([$userId]);
    } else if ($olympiadId) {
        $stmt = $pdo->prepare("SELECT * FROM `submissions` WHERE `olympiadId` = ? ORDER BY `score` DESC, `completedAt` ASC");
        $stmt->execute([$olympiadId]);
    } else {
        $stmt = $pdo->query("SELECT * FROM `submissions` ORDER BY `completedAt` DESC");
    }

    $subs = $stmt->fetchAll();
    foreach ($subs as &$s) {
        $s['score'] = (int)$s['score'];
        $s['maxScore'] = (int)$s['maxScore'];
        $s['percentage'] = (int)$s['percentage'];
        $s['rank'] = (int)$s['rank'];
        $s['timeSpentMinutes'] = (int)$s['timeSpentMinutes'];
        $s['answers'] = !empty($s['answers']) ? json_decode($s['answers'], true) : [];
    }

    echo json_encode(['status' => 'success', 'data' => $subs]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (empty($data['userId']) || empty($data['olympiadId'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing userId or olympiadId']);
        exit;
    }

    $id = $data['id'] ?? ('sub_' . time() . '_' . rand(100, 999));
    $userId = $data['userId'];
    $userName = $data['userName'] ?? 'Ishtirokchi';
    $olympiadId = $data['olympiadId'];
    $olympiadTitle = $data['olympiadTitle'] ?? 'Olimpiada';
    $score = (int)($data['score'] ?? 0);
    $maxScore = (int)($data['maxScore'] ?? 100);
    $percentage = (int)($data['percentage'] ?? round(($score / max($maxScore, 1)) * 100));
    $rank = (int)($data['rank'] ?? 1);
    $answers = json_encode($data['answers'] ?? []);
    $timeSpentMinutes = (int)($data['timeSpentMinutes'] ?? 0);
    $completedAt = $data['completedAt'] ?? date('Y-m-d H:i:s');
    $status = $data['status'] ?? 'published';

    $sql = "INSERT INTO `submissions` (
        `id`, `userId`, `userName`, `olympiadId`, `olympiadTitle`,
        `score`, `maxScore`, `percentage`, `rank`, `answers`,
        `timeSpentMinutes`, `completedAt`, `status`
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id, $userId, $userName, $olympiadId, $olympiadTitle,
        $score, $maxScore, $percentage, $rank, $answers,
        $timeSpentMinutes, $completedAt, $status
    ]);

    echo json_encode(['status' => 'success', 'message' => 'Submission saved to MySQL', 'id' => $id]);
    exit;
}
