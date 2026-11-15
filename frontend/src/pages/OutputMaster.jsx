
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";

import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  Clock,
  Trophy,
  Code2
} from "lucide-react";

import API from "../services/api";

function OutputMaster() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(120);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [result, setResult] = useState(null);

  const submittedRef = useRef(false);

  // LOAD QUESTIONS
  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setSubmitError("");

      setQuestions([]);
      setAnswers({});
      setCurrent(0);
      setTimeLeft(120);

      setFinished(false);
      setSubmitting(false);
      setResult(null);

      submittedRef.current = false;

      const response = await API.get(
        "/games/output-master?difficulty=Easy"
      );

      const loadedQuestions = response.data.questions || [];

      setQuestions(loadedQuestions);

      if (loadedQuestions.length === 0) {
        setError("No Output Master questions available.");
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to load Output Master questions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // INITIAL LOAD
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQuestions();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadQuestions]);

  // SUBMIT GAME
  const finishGame = useCallback(async () => {
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

      const response = await API.post(
        "/games/output-master/submit",
        {
          answers: formattedAnswers,
          time_taken: 120 - timeLeft
        }
      );

      console.log(
        "OUTPUT MASTER RESULT:",
        JSON.stringify(response.data, null, 2)
      );

      setResult(response.data.result);
      setFinished(true);

    } catch (err) {
      submittedRef.current = false;

      console.error("Output Master submission error:", err);
      console.error("Error response:", err.response?.data);

      setSubmitError(
        err.response?.data?.message ||
        err.message ||
        "Unable to submit Output Master."
      );

    } finally {
      setSubmitting(false);
    }
  }, [questions, answers, timeLeft, submitting]);

  // TIMER
  useEffect(() => {
    if (
      loading ||
      finished ||
      submitting ||
      questions.length === 0
    ) {
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);

  }, [loading, finished, submitting, questions.length]);

  // AUTO SUBMIT WHEN TIME ENDS
  useEffect(() => {
    if (
      timeLeft === 0 &&
      questions.length > 0 &&
      !finished
    ) {
      const timer = setTimeout(() => {
        finishGame();
      }, 0);

      return () => clearTimeout(timer);
    }
  }, [timeLeft, questions.length, finished, finishGame]);

  // SELECT ANSWER
  const selectAnswer = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[current].question_id]: option
    }));
  };

  // FORMAT TIMER
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remaining = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remaining
    ).padStart(2, "0")}`;
  };

  // LOADING SCREEN
  if (loading) {
    return (
      <div className="quiz-page">
        <h2>Loading Output Master...</h2>
      </div>
    );
  }

  // ERROR SCREEN
  if (error) {
    return (
      <div className="quiz-page">
        <h2>{error}</h2>

        <button onClick={loadQuestions}>
          Try Again
        </button>

        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
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

          <h1>Output Master Completed!</h1>

          <h2>{result.score} Points</h2>

          <p>
            Correct Answers: {result.correct_answers} /{" "}
            {result.total_questions}
          </p>

          <p>Wrong Answers: {result.wrong_answers}</p>

          <p>Total Points: {result.total_points}</p>

          <p>Current Level: {result.level}</p>

          <button onClick={loadQuestions}>
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
      </div>
    );
  }

  const options = [
    ["A", question.option_a],
    ["B", question.option_b],
    ["C", question.option_c],
    ["D", question.option_d]
  ];

  // MAIN GAME SCREEN
  return (
    <div className="quiz-page">

      <div className="quiz-header">

        <button onClick={() => navigate("/dashboard")}>
          <ArrowLeft size={18} />
          Exit
        </button>

        <h2>
          <Code2 size={22} />
          Output Master
        </h2>

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

          <span>
            💻 Predict the output!
          </span>

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

        <pre className="bug-code">
          {question.code_snippet}
        </pre>

        <h3>Select the correct output:</h3>

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
              onClick={finishGame}
            >
              {submitting ? "Submitting..." : "Submit Game"}
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

export default OutputMaster;
