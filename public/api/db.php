<?php
// ==========================================================
// NextOlymp — Database Connection (api/db.php)
// ==========================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$host = "127.0.0.1";
$port = "3306";
$dbname = "nextolymp"; // ISPmanager / UzCloud MySQL database
$username = "alimoff";  // Database user
$password = "Olimov6890"; // Database password

try {
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Baza bilan aloqa yo'q: " . $e->getMessage()
    ]);
    exit;
}

// Auto-initialize required database tables if not existing
function initNextOlympTables($pdo) {
    $sqls = [
        // 1. Users
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(64) PRIMARY KEY,
            `email` VARCHAR(191) NOT NULL UNIQUE,
            `phone` VARCHAR(64) DEFAULT NULL,
            `password` VARCHAR(255) DEFAULT NULL,
            `fullName` VARCHAR(255) NOT NULL,
            `name` VARCHAR(255) DEFAULT NULL,
            `score` INT DEFAULT 0,
            `role` ENUM('student', 'teacher', 'admin') DEFAULT 'student',
            `gender` ENUM('male', 'female') DEFAULT 'male',
            `grade` INT DEFAULT NULL,
            `region` VARCHAR(255) DEFAULT NULL,
            `district` VARCHAR(255) DEFAULT NULL,
            `school` VARCHAR(255) DEFAULT NULL,
            `avatarUrl` TEXT DEFAULT NULL,
            `parentConsent` TINYINT(1) DEFAULT 1,
            `createdAt` VARCHAR(64) NOT NULL,
            `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 2. Olympiads
        "CREATE TABLE IF NOT EXISTS `olympiads` (
            `id` VARCHAR(64) PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `subject` VARCHAR(64) NOT NULL,
            `description` TEXT DEFAULT NULL,
            `startDate` VARCHAR(64) NOT NULL,
            `endDate` VARCHAR(64) NOT NULL,
            `durationMinutes` INT DEFAULT 60,
            `totalQuestions` INT DEFAULT 25,
            `maxScore` INT DEFAULT 100,
            `registeredCount` INT DEFAULT 0,
            `retakeAllowed` TINYINT(1) DEFAULT 0,
            `maxRetakeAttempts` INT DEFAULT 2,
            `targetGrades` TEXT DEFAULT NULL,
            `allowedLanguages` TEXT DEFAULT NULL,
            `isFree` TINYINT(1) DEFAULT 1,
            `price` INT DEFAULT 0,
            `status` VARCHAR(32) DEFAULT 'ochiq',
            `organizer` VARCHAR(255) DEFAULT 'Next Olymp Hakamlar Hay\'ati',
            `antiCheatConfig` TEXT DEFAULT NULL,
            `createdAt` VARCHAR(64) NOT NULL,
            `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 3. Questions
        "CREATE TABLE IF NOT EXISTS `questions` (
            `id` VARCHAR(64) PRIMARY KEY,
            `olympiadId` VARCHAR(64) NOT NULL,
            `roundId` VARCHAR(64) DEFAULT 'r1',
            `type` VARCHAR(32) DEFAULT 'multiple_choice',
            `content` TEXT NOT NULL,
            `imageUrl` LONGTEXT DEFAULT NULL,
            `options` LONGTEXT DEFAULT NULL,
            `optionImages` LONGTEXT DEFAULT NULL,
            `correctAnswer` VARCHAR(255) DEFAULT 'A',
            `points` INT DEFAULT 4,
            `orderNum` INT DEFAULT 1,
            INDEX (`olympiadId`),
            FOREIGN KEY (`olympiadId`) REFERENCES `olympiads`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 4. National Exams (Milliy Sertifikat)
        "CREATE TABLE IF NOT EXISTS `national_exams` (
            `id` VARCHAR(64) PRIMARY KEY,
            `title` VARCHAR(255) NOT NULL,
            `subject` VARCHAR(64) NOT NULL,
            `description` TEXT DEFAULT NULL,
            `specType` VARCHAR(64) DEFAULT 'spec_1',
            `durationMinutes` INT DEFAULT 150,
            `maxScore` INT DEFAULT 75,
            `aThreshold` INT DEFAULT 65,
            `calculationMethod` VARCHAR(32) DEFAULT 'rasch',
            `totalQuestions` INT DEFAULT 45,
            `registeredCount` INT DEFAULT 0,
            `submittedCount` INT DEFAULT 0,
            `paidCount` INT DEFAULT 0,
            `totalRevenue` INT DEFAULT 0,
            `isPinned` TINYINT(1) DEFAULT 0,
            `status` VARCHAR(32) DEFAULT 'ochiq',
            `questions` LONGTEXT DEFAULT NULL,
            `createdAt` VARCHAR(64) NOT NULL,
            `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 5. Submissions
        "CREATE TABLE IF NOT EXISTS `submissions` (
            `id` VARCHAR(64) PRIMARY KEY,
            `userId` VARCHAR(64) NOT NULL,
            `userName` VARCHAR(255) NOT NULL,
            `olympiadId` VARCHAR(64) NOT NULL,
            `olympiadTitle` VARCHAR(255) NOT NULL,
            `score` INT DEFAULT 0,
            `maxScore` INT DEFAULT 100,
            `percentage` INT DEFAULT 0,
            `rank` INT DEFAULT 1,
            `answers` LONGTEXT DEFAULT NULL,
            `timeSpentMinutes` INT DEFAULT 0,
            `completedAt` VARCHAR(64) NOT NULL,
            `status` VARCHAR(32) DEFAULT 'published',
            INDEX (`userId`),
            INDEX (`olympiadId`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 6. Anti Cheat Logs
        "CREATE TABLE IF NOT EXISTS `anti_cheat_logs` (
            `id` VARCHAR(64) PRIMARY KEY,
            `studentId` VARCHAR(64) NOT NULL,
            `studentName` VARCHAR(255) NOT NULL,
            `studentEmail` VARCHAR(191) DEFAULT NULL,
            `studentPhone` VARCHAR(64) DEFAULT NULL,
            `olympiadId` VARCHAR(64) NOT NULL,
            `olympiadTitle` VARCHAR(255) NOT NULL,
            `eventType` VARCHAR(64) NOT NULL,
            `details` TEXT DEFAULT NULL,
            `severity` VARCHAR(32) DEFAULT 'O\'rta',
            `timestamp` VARCHAR(64) NOT NULL,
            `snapshotUrl` LONGTEXT DEFAULT NULL,
            `ipAddress` VARCHAR(64) DEFAULT NULL,
            `status` VARCHAR(32) DEFAULT 'pending',
            INDEX (`studentId`),
            INDEX (`olympiadId`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;",

        // 7. Certificates
        "CREATE TABLE IF NOT EXISTS `certificates` (
            `id` VARCHAR(64) PRIMARY KEY,
            `userId` VARCHAR(64) NOT NULL,
            `userName` VARCHAR(255) NOT NULL,
            `olympiadId` VARCHAR(64) NOT NULL,
            `olympiadTitle` VARCHAR(255) NOT NULL,
            `certificateCode` VARCHAR(64) NOT NULL UNIQUE,
            `score` INT DEFAULT 0,
            `rank` INT DEFAULT 1,
            `issueDate` VARCHAR(64) NOT NULL,
            INDEX (`userId`),
            INDEX (`certificateCode`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;"
    ];

    foreach ($sqls as $sql) {
        $pdo->exec($sql);
    }

    // Auto-migration checks
    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) DEFAULT NULL AFTER `phone`;");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `name` VARCHAR(255) DEFAULT NULL AFTER `fullName`;");
    } catch (Exception $e) {}

    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `score` INT DEFAULT 0 AFTER `name`;");
    } catch (Exception $e) {}
}

initNextOlympTables($pdo);
