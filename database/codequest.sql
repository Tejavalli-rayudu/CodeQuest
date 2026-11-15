CREATE DATABASE codequest;

USE codequest;
SHOW TABLES;
-- 1. USERS TABLE
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0,
    level INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. QUESTIONS TABLE
CREATE TABLE questions (
    question_id INT AUTO_INCREMENT PRIMARY KEY,
    game_type ENUM(
        'quiz',
        'bug_hunter',
        'output_master',
        'missing_code'
    ) NOT NULL,
    language VARCHAR(50) DEFAULT 'C++',
    difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    points INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. GAME ATTEMPTS TABLE
CREATE TABLE game_attempts (
    attempt_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    game_type ENUM(
        'quiz',
        'bug_hunter',
        'output_master',
        'missing_code'
    ) NOT NULL,
    total_questions INT DEFAULT 0,
    correct_answers INT DEFAULT 0,
    score INT DEFAULT 0,
    time_taken INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id)
    REFERENCES users(user_id)
    ON DELETE CASCADE
);

-- 4. ATTEMPT ANSWERS TABLE
CREATE TABLE attempt_answers (
    answer_id INT AUTO_INCREMENT PRIMARY KEY,
    attempt_id INT NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (attempt_id)
    REFERENCES game_attempts(attempt_id)
    ON DELETE CASCADE,

    FOREIGN KEY (question_id)
    REFERENCES questions(question_id)
);
