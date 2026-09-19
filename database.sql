-- ==========================================================
-- NextOlymp — Rasmiy MySQL Ma'lumotlar Bazasi Tuzilishi
-- Fayl: database.sql
-- ==========================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Foydalanuvchilar va rollar
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(150) NOT NULL,
    `phone` VARCHAR(30) UNIQUE NOT NULL,
    `email` VARCHAR(191) NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('student', 'teacher', 'admin') DEFAULT 'student',
    `region` VARCHAR(100) DEFAULT '',
    `district` VARCHAR(100) DEFAULT '',
    `school` VARCHAR(150) DEFAULT '',
    `grade` INT DEFAULT 9,
    `avatar_url` TEXT DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Olimpiadalar va Milliy imtihonlar
CREATE TABLE IF NOT EXISTS `olympiads` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(255) NOT NULL,
    `category` VARCHAR(100) NOT NULL, -- Masalan: 'english', 'math', 'national_exam'
    `description` TEXT DEFAULT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `duration_minutes` INT DEFAULT 60,
    `price` DECIMAL(10, 2) DEFAULT 0.00,
    `status` ENUM('upcoming', 'active', 'finished') DEFAULT 'upcoming',
    `max_score` INT DEFAULT 100,
    `total_questions` INT DEFAULT 25,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Savollar ombori
CREATE TABLE IF NOT EXISTS `questions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `olympiad_id` INT NOT NULL,
    `question_text` TEXT NOT NULL,
    `option_a` VARCHAR(255) NOT NULL,
    `option_b` VARCHAR(255) NOT NULL,
    `option_c` VARCHAR(255) NOT NULL,
    `option_d` VARCHAR(255) NOT NULL,
    `correct_option` CHAR(1) NOT NULL,
    `difficulty_level` DECIMAL(4, 2) DEFAULT 0.00, -- Rasch modeli qiyinlik darajasi (b_i)
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`olympiad_id`),
    FOREIGN KEY (`olympiad_id`) REFERENCES `olympiads`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Test topshirish natijalari va Rasch bali
CREATE TABLE IF NOT EXISTS `submissions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `olympiad_id` INT NOT NULL,
    `score` INT DEFAULT 0,
    `total_questions` INT DEFAULT 0,
    `rasch_theta` DECIMAL(5, 2) DEFAULT 0.00, -- Rasch modeli qobiliyat darajasi (theta)
    `answers_json` LONGTEXT DEFAULT NULL,
    `status` ENUM('in_progress', 'completed', 'disqualified') DEFAULT 'in_progress',
    `started_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    `submitted_at` DATETIME NULL,
    INDEX (`user_id`),
    INDEX (`olympiad_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`olympiad_id`) REFERENCES `olympiads`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Kiberxavfsizlik va Anti-Cheat jurnali (Logs)
CREATE TABLE IF NOT EXISTS `security_logs` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL,
    `ip_address` VARCHAR(45) NOT NULL,
    `event_type` VARCHAR(100) NOT NULL, -- 'tab_switch', 'copy_attempt', 'brute_force', 'rate_limit'
    `details` TEXT NULL,
    `severity` VARCHAR(32) DEFAULT 'medium',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. To'lovlar (Payme / Click / Uzum)
CREATE TABLE IF NOT EXISTS `payments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `olympiad_id` INT NOT NULL,
    `amount` DECIMAL(10, 2) NOT NULL,
    `provider` ENUM('click', 'payme', 'uzum') NOT NULL,
    `status` ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
    `transaction_id` VARCHAR(100) NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`user_id`),
    INDEX (`olympiad_id`),
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE,
    FOREIGN KEY (`olympiad_id`) REFERENCES `olympiads`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Xabarnomalar (Notifications)
CREATE TABLE IF NOT EXISTS `notifications` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NULL, -- NULL bo'lsa barcha foydalanuvchilar uchun
    `title` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `is_read` BOOLEAN DEFAULT FALSE,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
