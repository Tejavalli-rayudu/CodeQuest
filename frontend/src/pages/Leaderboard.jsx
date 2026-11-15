import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, RefreshCw } from "lucide-react";
import API from "../services/api";

function Leaderboard() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadLeaderboard = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await API.get("/games/leaderboard");

      setPlayers(response.data.leaderboard || []);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setError("Unable to load leaderboard. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadLeaderboard();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadLeaderboard]);

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return index + 1;
  };

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-container">

        <Link to="/dashboard" className="back-link">
          <ArrowLeft size={18} />
          Back to Dashboard
        </Link>

        <div className="leaderboard-heading">
          <Trophy size={45} />
          <h1>Leaderboard</h1>
          <p>Compete, learn and become the coding champion!</p>
        </div>

        <div className="leaderboard-card">
          <div className="leaderboard-title">
            <div>
              <h2>Top Players</h2>
              <p>Top 10 players based on total points</p>
            </div>

            <button
              className="refresh-btn"
              onClick={loadLeaderboard}
              title="Refresh leaderboard"
            >
              <RefreshCw size={18} />
            </button>
          </div>

          {loading ? (
            <p className="leaderboard-message">Loading leaderboard...</p>
          ) : error ? (
            <div className="leaderboard-message">
              <p>{error}</p>
              <button className="refresh-btn" onClick={loadLeaderboard}>
                Try Again
              </button>
            </div>
          ) : players.length === 0 ? (
            <p className="leaderboard-message">
              No players found. Play a game to get started!
            </p>
          ) : (
            <div className="leaderboard-list">
              {players.map((player, index) => (
                <div
                  className={`leaderboard-row ${
                    index === 0 ? "first-place" : ""
                  }`}
                  key={player.user_id}
                >
                  <div className="player-rank">
                    {getRankIcon(index)}
                  </div>

                  <div className="player-info">
                    <h3>{player.name}</h3>
                    <span>Level {player.level}</span>
                  </div>

                  <div className="player-points">
                    <strong>{player.total_points}</strong>
                    <span>Points</span>
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

export default Leaderboard;