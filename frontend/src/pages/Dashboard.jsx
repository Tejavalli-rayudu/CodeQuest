
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Code2,
  Trophy,
  Star,
  Target,
  Gamepad2,
  LogOut,
  UserRound,
  Medal
} from "lucide-react";

import API from "../services/api";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    return JSON.parse(sessionStorage.getItem("user") || "null");
  });

  const [loading, setLoading] = useState(true);

  // Load latest player information from backend
  const loadDashboard = useCallback(async () => {
    try {
      const response = await API.get("/games/profile");

      const latestUser = response.data.profile;

      setUser(latestUser);

      const oldUser = JSON.parse(
        sessionStorage.getItem("user") || "{}"
      );

      sessionStorage.setItem(
        "user",
        JSON.stringify({
          ...oldUser,
          ...latestUser
        })
      );
    } catch (error) {
      console.error("Dashboard error:", error);

      if (error.response?.status === 401) {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, [loadDashboard]);

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    navigate("/login");
  };

  // Game details
  const games = [
    {
      title: "Code Quiz",
      description: "Test your programming knowledge.",
      icon: <Code2 size={28} />,
      color: "purple",
      path: "/games/quiz"
    },
    {
      title: "Bug Hunter",
      description: "Find and fix errors in code.",
      icon: <Target size={28} />,
      color: "pink",
      path: "/games/bug-hunter"
    },
    {
      title: "Output Master",
      description: "Predict the output of programs.",
      icon: <Star size={28} />,
      color: "blue",
      path: "/games/output-master"
    },
    {
      title: "Missing Code",
      description: "Complete the missing code.",
      icon: <Gamepad2 size={28} />,
      color: "orange",
      path: "/games/missing-code"
    }
  ];

  return (
    <div className="dashboard-page">

      {/* NAVBAR */}
      <nav className="dashboard-nav">

        <Link to="/" className="auth-logo">
          <Code2 size={28} />
          Code<span>Quest</span>
        </Link>

        <div className="dashboard-nav-links">

          <Link to="/profile" className="dashboard-nav-link">
            <UserRound size={18} />
            Profile
          </Link>

          <Link to="/leaderboard" className="dashboard-nav-link">
            <Medal size={18} />
            Leaderboard
          </Link>

          <button
            onClick={handleLogout}
            className="logout-btn"
          >
            <LogOut size={18} />
            Logout
          </button>

        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="dashboard-content">

        {/* WELCOME SECTION */}
        <div className="dashboard-welcome">

          <p className="dashboard-label">
            YOUR ADVENTURE STARTS HERE
          </p>

          <h1>
            Welcome, {user?.name || "Player"}! 👋
          </h1>

          <p>
            Ready to level up your coding skills?
          </p>

        </div>

        {/* PLAYER STATISTICS */}
        <div className="dashboard-stats">

          <div className="dashboard-stat">
            <Star size={25} />

            <div>
              <h2>
                {loading ? "..." : user?.total_points ?? 0}
              </h2>
              <p>Total Points</p>
            </div>
          </div>

          <div className="dashboard-stat">
            <Trophy size={25} />

            <div>
              <h2>
                {loading ? "..." : user?.level ?? 1}
              </h2>
              <p>Current Level</p>
            </div>
          </div>

          <div className="dashboard-stat">
            <Gamepad2 size={25} />

            <div>
              <h2>4</h2>
              <p>Game Modes</p>
            </div>
          </div>

        </div>

        {/* GAME SECTION */}
        <section className="dashboard-games">

          <div className="dashboard-section-heading">
            <h2>Choose Your Challenge</h2>
            <p>
              Pick a game and start earning points!
            </p>
          </div>

          <div className="dashboard-game-grid">

            {games.map((game) => (
              <div
                className="dashboard-game-card"
                key={game.title}
              >

                <div
                  className={`dashboard-game-icon ${game.color}`}
                >
                  {game.icon}
                </div>

                <h3>{game.title}</h3>

                <p>{game.description}</p>

                <Link to={game.path}>
                  Play Now →
                </Link>

              </div>
            ))}

          </div>
        </section>

        {/* QUICK LINKS */}
        <section className="dashboard-quick-links">

          <Link to="/profile" className="quick-link-card">
            <UserRound size={25} />

            <div>
              <h3>My Profile</h3>
              <p>View your points and game history</p>
            </div>
          </Link>

          <Link to="/leaderboard" className="quick-link-card">
            <Medal size={25} />

            <div>
              <h3>Leaderboard</h3>
              <p>Check your ranking against other players</p>
            </div>
          </Link>

        </section>

      </main>
    </div>
  );
}

export default Dashboard;
