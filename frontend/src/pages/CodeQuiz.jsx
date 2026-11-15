
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Trophy } from "lucide-react";
import API from "../services/api";

function CodeQuiz() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [difficulty, setDifficulty] = useState("Easy");
  const [timeLeft, setTimeLeft] = useState(120);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const submittedRef = useRef(false);

  // LOAD RANDOM QUIZ QUESTIONS
  const loadQuiz = useCallback(async (level = "Easy") => {
    try {
      setLoading(true);
      setError("");
      setSubmitError("");

      setQuestions([]);
      setAnswers({});
      setCurrent(0);
      setFinished(false);
      setSubmitting(false);
      setResult(null);
      setTimeLeft(120);

      submittedRef.current = false;

      const response = await API.get(
        `/games/quiz?difficulty=${encodeURIComponent(level)}`,
        {
          params: {
            refresh: Date.now()
          }
        }
      );

      const newQuestions = response.data.questions || [];

      // Check question IDs in browser console
      console.log(
        "New Quiz Question IDs:",
        newQuestions.map((q) => q.question_id)
      );

      setQuestions(newQuestions);

      if (newQuestions.length === 0) {
        setError("No questions available for this difficulty.");
      }
    } catch (err) {
      console.error("Quiz loading error:", err);

      setError(
        err.response?.data?.message ||
        "Unable to load quiz. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD QUIZ WHEN PAGE OPENS
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadQuiz("Easy");
  }, [loadQuiz]);

  // SELECT ANSWER
  const selectAnswer = (option) => {
    if (!questions[current] || submitting) return;

    setAnswers((prev) => ({
      ...prev,
      [questions[current].question_id]: option
    }));
  };

  // SUBMIT QUIZ
  const finishQuiz = useCallback(async () => {
    if (
      submittedRef.current ||
      submitting ||
      questions.length === 0
    ) {
      return;
    }

    submittedRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const formattedAnswers = questions.map((question) => ({
        question_id: question.question_id,
        user_answer: answers[question.question_id] || ""
      }));

      const response = await API.post("/games/quiz/submit", {
        answers: formattedAnswers,
        time_taken: 120 - timeLeft
      });

      console.log("QUIZ RESULT:", response.data);

      setResult(response.data.result || response.data);
setFinished(true);
    } catch (err) {
      console.error("Quiz submission error:", err);

      submittedRef.current = false;

      if (err.response?.status === 401) {
        setSubmitError(
          "Your login session is invalid. Please log in again."
        );
      } else {
        setSubmitError(
          err.response?.data?.message ||
          "Unable to submit quiz. Please try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [questions, answers, timeLeft, submitting]);

  // COUNTDOWN TIMER
  useEffect(() => {
    if (
      !questions.length ||
      finished ||
      loading ||
      submitting
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [questions.length, finished, loading, submitting]);

  // AUTOMATIC SUBMISSION WHEN TIMER ENDS
  useEffect(() => {
    if (
      timeLeft === 0 &&
      questions.length > 0 &&
      !finished
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      finishQuiz();
    }
  }, [timeLeft, questions.length, finished, finishQuiz]);

  // FORMAT TIMER
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  // RESTART QUIZ
  const restartQuiz = () => {
    loadQuiz(difficulty);
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="quiz-page">
        <h2>Loading your questions...</h2>
      </div>
    );
  }

  // ERROR SCREEN
  if (error) {
    return (
      <div className="quiz-page">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} /> Dashboard
        </button>

        <h2>{error}</h2>

        <button onClick={() => loadQuiz(difficulty)}>
          Try Again
        </button>
      </div>
    );
  }

  // RESULT SCREEN
  if (finished && result) {
    return (
      <div className="quiz-page">
        <div className="quiz-result">
          <Trophy size={55} />

          <h1>Quiz Completed!</h1>

          <h2>{result.score} Points</h2>

          <p>
            Correct Answers: {result.correct_answers} /{" "}
            {result.total_questions}
          </p>

          <p>Wrong Answers: {result.wrong_answers}</p>

          <p>Total Points: {result.total_points}</p>

          <p>Current Level: {result.level}</p>

          <button onClick={restartQuiz}>
            Play Again
          </button>

          <button onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const question = questions[current];

  if (!question) {
    return (
      <div className="quiz-page">
        <h2>No questions available.</h2>

        <button onClick={() => loadQuiz(difficulty)}>
          Try Again
        </button>
      </div>
    );
  }

  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d]
  ];

  // MAIN QUIZ PAGE
  return (
    <div className="quiz-page">

      <div className="quiz-header">
        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} /> Exit
        </button>

        <h2>CodeQuest Quiz</h2>

        <div className="quiz-timer">
          <Clock size={18} />
          {formatTime(timeLeft)}
        </div>
      </div>

      <div className="quiz-container">

        <div className="quiz-top">
          <span>
            Question {current + 1} of {questions.length}
          </span>

          <select
            value={difficulty}
            disabled={submitting}
            onChange={(e) => {
              const level = e.target.value;

              setDifficulty(level);
              loadQuiz(level);
            }}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="quiz-progress">
          <div
            style={{
              width: `${
                ((current + 1) / questions.length) * 100
              }%`
            }}
          />
        </div>

        <p className="quiz-language">
          {question.language} | {question.difficulty}
        </p>

        <h2 className="quiz-question">
          {question.question_text}
        </h2>

        <div className="quiz-options">
          {options.map(([letter, text]) => (
            <button
              key={letter}
              disabled={submitting}
              className={
                answers[question.question_id] === letter
                  ? "quiz-option selected"
                  : "quiz-option"
              }
              onClick={() => selectAnswer(letter)}
            >
              <span>{letter}</span>
              {text}
            </button>
          ))}
        </div>

        {submitError && (
          <p className="auth-error">
            {submitError}
          </p>
        )}

        <div className="quiz-navigation">
          <button
            disabled={current === 0 || submitting}
            onClick={() => setCurrent((prev) => prev - 1)}
          >
            Previous
          </button>

          {current === questions.length - 1 ? (
            <button
              disabled={submitting}
              onClick={finishQuiz}
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              disabled={submitting}
              onClick={() => setCurrent((prev) => prev + 1)}
            >
              Next Question
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default CodeQuiz;
