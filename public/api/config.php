<?php
// ==========================================================
// NextOlymp — Database Configuration & Auto Schema Setup
// ==========================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$db_host = '127.0.0.1';
$db_name = 'nextolymp';
$db_user = 'alimoff';
$db_pass = 'Olimov6890';
$db_port = '3306';

try {
    $pdo = new PDO("mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage()
    ]);
    exit;
}

// Auto-create core database tables if they do not exist
function initDatabase($pdo) {
    $tables = [
        // 1. Users table
        "CREATE TABLE IF NOT EXISTS `users` (
            `id` VARCHAR(64) PRIMARY KEY,
            `email` VARCHAR(191) NOT NULL UNIQUE,
            `phone` VARCHAR(64) DEFAULT NULL,
            `password` VARCHAR(255) DEFAULT NULL,
            `fullName` VARCHAR(255) NOT NULL,
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

        // 2. Olympiads table
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

        // 3. Questions table
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

        // 4. Submissions table
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

        // 5. Anti-Cheat Incident Logs table
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

        // 6. Certificates table
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

    foreach ($tables as $sql) {
        $pdo->exec($sql);
    }

    try {
        $pdo->exec("ALTER TABLE `users` ADD COLUMN `password` VARCHAR(255) DEFAULT NULL AFTER `phone`;");
    } catch (Exception $e) {
        // column already exists
    }
}

// Ensure database tables exist
initDatabase($pdo);
