
const express = require("express");
const router = express.Router();
const db = require("../config/db");

// GET CODE QUIZ QUESTIONS
router.get("/quiz", async (req, res) => {
  try {
    const difficulty = req.query.difficulty || "Easy";

    const [questions] = await db.query(
      `SELECT
        question_id,
        language,
        difficulty,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        points
       FROM questions
       WHERE game_type = 'quiz'
       AND difficulty = ?
       ORDER BY RAND()
       LIMIT 5`,
      [difficulty]
    );

    res.status(200).json({
      success: true,
      total: questions.length,
      questions
    });

  } catch (error) {
    console.error("Quiz error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load quiz questions"
    });
  }
});

const authMiddleware = require("../middleware/authMiddleware");
// GET BUG HUNTER QUESTIONS
router.get("/bug-hunter", async (req, res) => {
  try {
    const difficulty = req.query.difficulty || "Easy";

    const [questions] = await db.query(
      `SELECT
        question_id,
        language,
        difficulty,
        question_text,
        code_snippet,
        option_a,
        option_b,
        option_c,
        option_d,
        points
       FROM questions
       WHERE game_type = 'bug_hunter'
       AND difficulty = ?
       ORDER BY RAND()
       LIMIT 5`,
      [difficulty]
    );

    res.status(200).json({
      success: true,
      total: questions.length,
      questions
    });

  } catch (error) {
    console.error("Bug Hunter error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load Bug Hunter questions"
    });
  }
});


// SUBMIT QUIZ AND SAVE RESULT
router.post("/quiz/submit", authMiddleware, async (req, res) => {
  let connection;

  try {
    const { answers, time_taken } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Quiz answers are required"
      });
    }

    const questionIds = answers.map(answer => Number(answer.question_id));

    if (
      questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate question IDs"
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const placeholders = questionIds.map(() => "?").join(",");

    const [questions] = await connection.query(
      `SELECT question_id, correct_answer, points
       FROM questions
       WHERE game_type = 'quiz'
       AND question_id IN (${placeholders})`,
      questionIds
    );

    if (questions.length !== questionIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Some quiz questions are invalid"
      });
    }

    let correctAnswers = 0;
    let score = 0;

    const answerResults = answers.map(answer => {
      const question = questions.find(
        q => q.question_id === Number(answer.question_id)
      );

      const userAnswer = String(answer.user_answer ?? "").trim().toUpperCase();
      const correctAnswer = String(question.correct_answer).trim().toUpperCase();

      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        score += question.points;
      }

      return {
        question_id: question.question_id,
        user_answer: String(answer.user_answer ?? ""),
        is_correct: isCorrect
      };
    });

    const userId = req.user.user_id;

    const [attemptResult] = await connection.query(
      `INSERT INTO game_attempts
       (user_id, game_type, total_questions, correct_answers, score, time_taken)
       VALUES (?, 'quiz', ?, ?, ?, ?)`,
      [
        userId,
        answers.length,
        correctAnswers,
        score,
        Math.max(0, Number(time_taken) || 0)
      ]
    );

    const attemptId = attemptResult.insertId;

    for (const answer of answerResults) {
      await connection.query(
        `INSERT INTO attempt_answers
         (attempt_id, question_id, user_answer, is_correct)
         VALUES (?, ?, ?, ?)`,
        [
          attemptId,
          answer.question_id,
          answer.user_answer,
          answer.is_correct
        ]
      );
    }

    await connection.query(
      `UPDATE users
       SET total_points = total_points + ?,
           level = FLOOR((total_points + ?) / 100) + 1
       WHERE user_id = ?`,
      [score, score, userId]
    );

    const [userRows] = await connection.query(
      `SELECT total_points, level
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Quiz submitted successfully!",
      total_questions: answers.length,
      correct_answers: correctAnswers,
      wrong_answers: answers.length - correctAnswers,
      score,
      total_points: userRows[0].total_points,
      level: userRows[0].level
    });

  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Quiz submission error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to submit quiz"
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.post("/bug-hunter/submit", authMiddleware, async (req, res) => {
  let connection;

  try {
    const { answers, time_taken } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Bug Hunter answers are required"
      });
    }

    const questionIds = answers.map(answer =>
      Number(answer.question_id)
    );

    if (
      questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate question IDs"
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const placeholders = questionIds.map(() => "?").join(",");

    const [questions] = await connection.query(
      `SELECT question_id, correct_answer, points
       FROM questions
       WHERE game_type = 'bug_hunter'
       AND question_id IN (${placeholders})`,
      questionIds
    );

    if (questions.length !== questionIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid Bug Hunter questions"
      });
    }

    let correctAnswers = 0;
    let score = 0;

    const answerResults = answers.map(answer => {
      const question = questions.find(
        q => q.question_id === Number(answer.question_id)
      );

      const userAnswer = String(
        answer.user_answer ?? ""
      ).trim().toUpperCase();

      const correctAnswer = String(
        question.correct_answer
      ).trim().toUpperCase();

      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        score += Number(question.points);
      }

      return {
        question_id: question.question_id,
        user_answer: String(answer.user_answer ?? ""),
        is_correct: isCorrect
      };
    });

    const userId = req.user.user_id;

    const [attempt] = await connection.query(
      `INSERT INTO game_attempts
       (user_id, game_type, total_questions,
        correct_answers, score, time_taken)
       VALUES (?, 'bug_hunter', ?, ?, ?, ?)`,
      [
        userId,
        answers.length,
        correctAnswers,
        score,
        Math.max(0, Number(time_taken) || 0)
      ]
    );

    for (const answer of answerResults) {
      await connection.query(
        `INSERT INTO attempt_answers
         (attempt_id, question_id, user_answer, is_correct)
         VALUES (?, ?, ?, ?)`,
        [
          attempt.insertId,
          answer.question_id,
          answer.user_answer,
          answer.is_correct
        ]
      );
    }

    await connection.query(
      `UPDATE users
       SET total_points = total_points + ?,
           level = FLOOR((total_points + ?) / 100) + 1
       WHERE user_id = ?`,
      [score, score, userId]
    );

    const [userRows] = await connection.query(
      `SELECT total_points, level
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Bug Hunter submitted successfully!",
      result: {
        attempt_id: attempt.insertId,
        total_questions: answers.length,
        correct_answers: correctAnswers,
        wrong_answers: answers.length - correctAnswers,
        score,
        total_points: userRows[0].total_points,
        level: userRows[0].level
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Bug Hunter submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit Bug Hunter"
    });

  } finally {
    if (connection) connection.release();
  }
});

router.post("/output-master/submit", authMiddleware, async (req, res) => {
  let connection;

  try {
    const { answers, time_taken } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Output Master answers are required"
      });
    }

    const questionIds = answers.map(answer =>
      Number(answer.question_id)
    );

    if (
      questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate question IDs"
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const placeholders = questionIds.map(() => "?").join(",");

    const [questions] = await connection.query(
      `SELECT question_id, correct_answer, points
       FROM questions
       WHERE game_type = 'output_master'
       AND question_id IN (${placeholders})`,
      questionIds
    );

    if (questions.length !== questionIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid Output Master questions"
      });
    }

    let correctAnswers = 0;
    let score = 0;

    const answerResults = answers.map(answer => {
      const question = questions.find(
        q => q.question_id === Number(answer.question_id)
      );

      const userAnswer = String(
        answer.user_answer ?? ""
      ).trim().toUpperCase();

      const correctAnswer = String(
        question.correct_answer
      ).trim().toUpperCase();

      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        score += Number(question.points);
      }

      return {
        question_id: question.question_id,
        user_answer: String(answer.user_answer ?? ""),
        is_correct: isCorrect
      };
    });

    const userId = req.user.user_id;

    const [attempt] = await connection.query(
      `INSERT INTO game_attempts
       (user_id, game_type, total_questions,
        correct_answers, score, time_taken)
       VALUES (?, 'output_master', ?, ?, ?, ?)`,
      [
        userId,
        answers.length,
        correctAnswers,
        score,
        Math.max(0, Number(time_taken) || 0)
      ]
    );

    for (const answer of answerResults) {
      await connection.query(
        `INSERT INTO attempt_answers
         (attempt_id, question_id, user_answer, is_correct)
         VALUES (?, ?, ?, ?)`,
        [
          attempt.insertId,
          answer.question_id,
          answer.user_answer,
          answer.is_correct
        ]
      );
    }

    await connection.query(
      `UPDATE users
       SET total_points = total_points + ?,
           level = FLOOR((total_points + ?) / 100) + 1
       WHERE user_id = ?`,
      [score, score, userId]
    );

    const [userRows] = await connection.query(
      `SELECT total_points, level
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Output Master submitted successfully!",
      result: {
        attempt_id: attempt.insertId,
        total_questions: answers.length,
        correct_answers: correctAnswers,
        wrong_answers: answers.length - correctAnswers,
        score,
        total_points: userRows[0].total_points,
        level: userRows[0].level
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Output Master submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit Output Master"
    });

  } finally {
    if (connection) connection.release();
  }
});


// GET OUTPUT MASTER QUESTIONS
router.get("/output-master", async (req, res) => {
  try {
    const difficulty = req.query.difficulty || "Easy";

    const [questions] = await db.query(
      `SELECT
        question_id,
        language,
        difficulty,
        question_text,
        code_snippet,
        option_a,
        option_b,
        option_c,
        option_d,
        points
       FROM questions
       WHERE game_type = 'output_master'
       AND difficulty = ?
       ORDER BY RAND()
       LIMIT 5`,
      [difficulty]
    );

    res.status(200).json({
      success: true,
      total: questions.length,
      questions
    });

  } catch (error) {
    console.error("Output Master error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load Output Master questions"
    });
  }
});

// GET MISSING CODE QUESTIONS
router.get("/missing-code", async (req, res) => {
  try {
    const difficulty = req.query.difficulty || "Easy";

    const [questions] = await db.query(
      `SELECT
        question_id,
        language,
        difficulty,
        question_text,
        code_snippet,
        option_a,
        option_b,
        option_c,
        option_d,
        points
       FROM questions
       WHERE game_type = 'missing_code'
       AND difficulty = ?
       ORDER BY RAND()
       LIMIT 5`,
      [difficulty]
    );

    res.status(200).json({
      success: true,
      total: questions.length,
      questions
    });

  } catch (error) {
    console.error("Missing Code error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load Missing Code questions"
    });
  }
});


router.post("/missing-code/submit", authMiddleware, async (req, res) => {
  let connection;

  try {
    const { answers, time_taken } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Missing Code answers are required"
      });
    }

    const questionIds = answers.map(answer =>
      Number(answer.question_id)
    );

    if (
      questionIds.some(id => !Number.isInteger(id) || id <= 0) ||
      new Set(questionIds).size !== questionIds.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid or duplicate question IDs"
      });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    const placeholders = questionIds.map(() => "?").join(",");

    const [questions] = await connection.query(
      `SELECT question_id, correct_answer, points
       FROM questions
       WHERE game_type = 'missing_code'
       AND question_id IN (${placeholders})`,
      questionIds
    );

    if (questions.length !== questionIds.length) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Invalid Missing Code questions"
      });
    }

    let correctAnswers = 0;
    let score = 0;

    const answerResults = answers.map(answer => {
      const question = questions.find(
        q => q.question_id === Number(answer.question_id)
      );

      const userAnswer = String(
        answer.user_answer ?? ""
      ).trim().toUpperCase();

      const correctAnswer = String(
        question.correct_answer
      ).trim().toUpperCase();

      const isCorrect = userAnswer === correctAnswer;

      if (isCorrect) {
        correctAnswers++;
        score += Number(question.points);
      }

      return {
        question_id: question.question_id,
        user_answer: String(answer.user_answer ?? ""),
        is_correct: isCorrect
      };
    });

    const userId = req.user.user_id;

    const [attempt] = await connection.query(
      `INSERT INTO game_attempts
       (user_id, game_type, total_questions,
        correct_answers, score, time_taken)
       VALUES (?, 'missing_code', ?, ?, ?, ?)`,
      [
        userId,
        answers.length,
        correctAnswers,
        score,
        Math.max(0, Number(time_taken) || 0)
      ]
    );

    for (const answer of answerResults) {
      await connection.query(
        `INSERT INTO attempt_answers
         (attempt_id, question_id, user_answer, is_correct)
         VALUES (?, ?, ?, ?)`,
        [
          attempt.insertId,
          answer.question_id,
          answer.user_answer,
          answer.is_correct
        ]
      );
    }

    await connection.query(
      `UPDATE users
       SET total_points = total_points + ?,
           level = FLOOR((total_points + ?) / 100) + 1
       WHERE user_id = ?`,
      [score, score, userId]
    );

    const [userRows] = await connection.query(
      `SELECT total_points, level
       FROM users
       WHERE user_id = ?`,
      [userId]
    );

    await connection.commit();

    res.status(200).json({
      success: true,
      message: "Missing Code submitted successfully!",
      result: {
        attempt_id: attempt.insertId,
        total_questions: answers.length,
        correct_answers: correctAnswers,
        wrong_answers: answers.length - correctAnswers,
        score,
        total_points: userRows[0].total_points,
        level: userRows[0].level
      }
    });

  } catch (error) {
    if (connection) await connection.rollback();

    console.error("Missing Code submission error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit Missing Code"
    });

  } finally {
    if (connection) connection.release();
  }
});

// LEADERBOARD
router.get("/leaderboard", async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT
        user_id,
        name,
        total_points,
        level
      FROM users
      ORDER BY total_points DESC, name ASC
      LIMIT 10
    `);

    res.status(200).json({
      success: true,
      leaderboard: users
    });

  } catch (error) {
    console.error("Leaderboard error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to load leaderboard"
    });
  }
});

// PLAYER PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT user_id, name, email, total_points, level, created_at
       FROM users
       WHERE user_id = ?`,
      [req.user.user_id]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      profile: users[0]
    });

  } catch (error) {
    console.error("Profile error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load profile"
    });
  }
});


// PLAYER GAME HISTORY
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const [attempts] = await db.query(
      `SELECT
         attempt_id,
         game_type,
         total_questions,
         correct_answers,
         score,
         time_taken,
         played_at
       FROM game_attempts
       WHERE user_id = ?
       ORDER BY played_at DESC`,
      [req.user.user_id]
    );

    res.json({
      success: true,
      total: attempts.length,
      history: attempts
    });

  } catch (error) {
    console.error("History error:", error.message);
    res.status(500).json({
      success: false,
      message: "Unable to load game history"
    });
  }
});
module.exports = router;
