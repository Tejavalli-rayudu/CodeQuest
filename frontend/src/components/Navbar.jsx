
import { Link } from "react-router-dom";
import { Code2, Trophy, User, Home } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        <Code2 size={30} />
        <span>Code<span className="logo-highlight">Quest</span></span>
      </Link>

      <div className="nav-links">
        <Link to="/"><Home size={17} /> Home</Link>
        <Link to="/games"><Code2 size={17} /> Games</Link>
        <Link to="/leaderboard"><Trophy size={17} /> Leaderboard</Link>
      </div>

      <div className="nav-actions">
        <Link to="/login" className="login-link">Login</Link>
        <Link to="/signup" className="signup-btn">Get Started</Link>
        <User className="user-icon" size={22} />
      </div>
    </nav>
  );
}

export default Navbar;
