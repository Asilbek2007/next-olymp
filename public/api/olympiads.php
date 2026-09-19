<?php
// ==========================================================
// NextOlymp — Olympiads & Questions API
// ==========================================================

require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return all olympiads with their associated questions
    $stmt = $pdo->query("SELECT * FROM `olympiads` ORDER BY `createdAt` DESC");
    $olympiads = $stmt->fetchAll();

    foreach ($olympiads as &$olymp) {
        $olymp['targetGrades'] = !empty($olymp['targetGrades']) ? json_decode($olymp['targetGrades'], true) : [5,6,7,8,9,10,11];
        $olymp['allowedLanguages'] = !empty($olymp['allowedLanguages']) ? json_decode($olymp['allowedLanguages'], true) : ["O'zbek tili", "Rus tili", "Ingliz tili"];
        $olymp['retakeAllowed'] = (bool)$olymp['retakeAllowed'];
        $olymp['isFree'] = (bool)$olymp['isFree'];
        $olymp['durationMinutes'] = (int)$olymp['durationMinutes'];
        $olymp['totalQuestions'] = (int)$olymp['totalQuestions'];
        $olymp['maxScore'] = (int)$olymp['maxScore'];
        $olymp['registeredCount'] = (int)$olymp['registeredCount'];
        $olymp['maxRetakeAttempts'] = (int)$olymp['maxRetakeAttempts'];

        // Fetch questions for this olympiad
        $qStmt = $pdo->prepare("SELECT * FROM `questions` WHERE `olympiadId` = ? ORDER BY `orderNum` ASC");
        $qStmt->execute([$olymp['id']]);
        $questions = $qStmt->fetchAll();

        foreach ($questions as &$q) {
            $q['options'] = !empty($q['options']) ? json_decode($q['options'], true) : [];
            $q['optionImages'] = !empty($q['optionImages']) ? json_decode($q['optionImages'], true) : [];
            $q['points'] = (int)$q['points'];
            $q['order'] = (int)$q['orderNum'];
        }
        $olymp['questions'] = $questions;
    }

    echo json_encode(['status' => 'success', 'data' => $olympiads]);
    exit;
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);

    if (empty($data['id']) || empty($data['title'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing required fields (id, title)']);
        exit;
    }

    $id = $data['id'];
    $title = $data['title'];
    $subject = $data['subject'] ?? 'math';
    $description = $data['description'] ?? '';
    $startDate = $data['startDate'] ?? date('Y-m-d H:i:s');
    $endDate = $data['endDate'] ?? date('Y-m-d H:i:s', time() + 7 * 86400);
    $durationMinutes = (int)($data['durationMinutes'] ?? 60);
    $totalQuestions = (int)($data['questionsCount'] ?? (isset($data['questions']) ? count($data['questions']) : 25));
    $maxScore = (int)($data['maxScore'] ?? 100);
    $registeredCount = (int)($data['registeredCount'] ?? 0);
    $retakeAllowed = !empty($data['retakeAllowed']) ? 1 : 0;
    $maxRetakeAttempts = (int)($data['maxRetakeAttempts'] ?? 2);
    $targetGrades = json_encode($data['targetGrades'] ?? [5,6,7,8,9,10,11]);
    $allowedLanguages = json_encode($data['allowedLanguages'] ?? ["O'zbek tili", "Rus tili", "Ingliz tili"]);
    $isFree = !empty($data['isFree']) ? 1 : 0;
    $price = (int)($data['price'] ?? 0);
    $status = $data['status'] ?? 'ochiq';
    $organizer = $data['organizer'] ?? 'Next Olymp Hakamlar Hay\'ati';
    $antiCheatConfig = isset($data['antiCheatConfig']) ? json_encode($data['antiCheatConfig']) : null;
    $createdAt = $data['createdAt'] ?? date('Y-m-d H:i:s');

    // UPSERT Olympiad
    $sql = "INSERT INTO `olympiads` (
        `id`, `title`, `subject`, `description`, `startDate`, `endDate`,
        `durationMinutes`, `totalQuestions`, `maxScore`, `registeredCount`,
        `retakeAllowed`, `maxRetakeAttempts`, `targetGrades`, `allowedLanguages`,
        `isFree`, `price`, `status`, `organizer`, `antiCheatConfig`, `createdAt`
    ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
    ) ON DUPLICATE KEY UPDATE
        `title` = VALUES(`title`),
        `subject` = VALUES(`subject`),
        `description` = VALUES(`description`),
        `startDate` = VALUES(`startDate`),
        `endDate` = VALUES(`endDate`),
        `durationMinutes` = VALUES(`durationMinutes`),
        `totalQuestions` = VALUES(`totalQuestions`),
        `maxScore` = VALUES(`maxScore`),
        `registeredCount` = VALUES(`registeredCount`),
        `retakeAllowed` = VALUES(`retakeAllowed`),
        `maxRetakeAttempts` = VALUES(`maxRetakeAttempts`),
        `targetGrades` = VALUES(`targetGrades`),
        `allowedLanguages` = VALUES(`allowedLanguages`),
        `isFree` = VALUES(`isFree`),
        `price` = VALUES(`price`),
        `status` = VALUES(`status`),
        `organizer` = VALUES(`organizer`),
        `antiCheatConfig` = VALUES(`antiCheatConfig`);";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $id, $title, $subject, $description, $startDate, $endDate,
        $durationMinutes, $totalQuestions, $maxScore, $registeredCount,
        $retakeAllowed, $maxRetakeAttempts, $targetGrades, $allowedLanguages,
        $isFree, $price, $status, $organizer, $antiCheatConfig, $createdAt
    ]);

    // Save Questions if provided
    if (isset($data['questions']) && is_array($data['questions'])) {
        // Delete old questions for clean replace
        $del = $pdo->prepare("DELETE FROM `questions` WHERE `olympiadId` = ?");
        $del->execute([$id]);

        $qInsert = $pdo->prepare("INSERT INTO `questions` (
            `id`, `olympiadId`, `roundId`, `type`, `content`, `imageUrl`,
            `options`, `optionImages`, `correctAnswer`, `points`, `orderNum`
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

        $order = 1;
        foreach ($data['questions'] as $q) {
            $qId = $q['id'] ?? "q_{$id}_{$order}";
            $roundId = $q['roundId'] ?? 'r1';
            $type = $q['type'] ?? 'multiple_choice';
            $content = $q['content'] ?? ($q['text'] ?? "Savol #{$order}");
            $imageUrl = $q['imageUrl'] ?? null;
            $options = json_encode($q['options'] ?? []);
            $optionImages = json_encode($q['optionImages'] ?? []);
            $correctAnswer = $q['correctAnswer'] ?? 'A';
            $points = (int)($q['points'] ?? 4);

            $qInsert->execute([
                $qId, $id, $roundId, $type, $content, $imageUrl,
                $options, $optionImages, $correctAnswer, $points, $order
            ]);
            $order++;
        }
    }

    echo json_encode(['status' => 'success', 'message' => 'Olympiad saved to MySQL', 'id' => $id]);
    exit;
}

if ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if (!$id) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'ID is required']);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM `olympiads` WHERE `id` = ?");
    $stmt->execute([$id]);

    echo json_encode(['status' => 'success', 'message' => 'Olympiad deleted from MySQL']);
    exit;
}
