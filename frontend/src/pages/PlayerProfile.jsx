import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  UserRound,
  Trophy,
  Star,
  Gamepad2
} from "lucide-react";
import API from "../services/api";
import "./PlayerProfile.css";
function PlayerProfile() {
  const [profile, setProfile] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [profileResponse, historyResponse] = await Promise.all([
        API.get("/games/profile"),
        API.get("/games/history")
      ]);

      setProfile(profileResponse.data.profile);
      setHistory(historyResponse.data.history || []);
    } catch (err) {
      console.error("Profile loading error:", err);
      setError(
        err.response?.data?.message ||
        "Unable to load your profile. Please log in again."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProfile();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadProfile]);

  const formatGameName = (gameType) => {
    const names = {
      quiz: "Code Quiz",
      bug_hunter: "Bug Hunter",
      output_master: "Output Master",
      missing_code: "Missing Code"
    };

    return names[gameType] || gameType;
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-message">Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-page">
        <p className="profile-message">{error}</p>
        <button className="profile-retry" onClick={loadProfile}>
          Try Again
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <p className="profile-message">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="profile-heading">
          <UserRound size={38} />
          <h1>Player Profile</h1>
          <p>Your CodeQuest gaming journey</p>
        </div>

        <div className="profile-card">
          <div className="profile-avatar">
            {profile.name.charAt(0).toUpperCase()}
          </div>

          <h2>{profile.name}</h2>
          <p className="profile-email">{profile.email}</p>

          <div className="profile-stats">
            <div className="profile-stat">
              <Trophy size={23} />
              <strong>{profile.total_points}</strong>
              <span>Total Points</span>
            </div>

            <div className="profile-stat">
              <Star size={23} />
              <strong>{profile.level}</strong>
              <span>Current Level</span>
            </div>

            <div className="profile-stat">
              <Gamepad2 size={23} />
              <strong>{history.length}</strong>
              <span>Games Played</span>
            </div>
          </div>
        </div>

        <div className="history-card">
          <div className="history-heading">
            <div>
              <h2>Game History</h2>
              <p>Your previously completed games</p>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="profile-message">
              No game history yet. Start playing to see your scores here!
            </p>
          ) : (
            <div className="history-list">
              {history.map((game) => (
                <div className="history-row" key={game.attempt_id}>
                  <div className="history-icon">
                    <Gamepad2 size={23} />
                  </div>

                  <div className="history-info">
                    <h3>{formatGameName(game.game_type)}</h3>
                    <span>
                      {new Date(game.played_at).toLocaleString()}
                    </span>
                  </div>

                  <div className="history-score">
                    <strong>{game.score} pts</strong>
                    <span>
                      {game.correct_answers}/{game.total_questions} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default PlayerProfile;