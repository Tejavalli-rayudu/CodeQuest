
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Code2, Eye, EyeOff, Mail, Lock } from "lucide-react";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await API.post("/auth/login", formData);

      // Save authentication details for this browser session
      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert("Welcome back to CodeQuest!");

      navigate("/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Login failed. Please check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <Link to="/" className="auth-logo">
          <Code2 size={32} />
          Code<span>Quest</span>
        </Link>

        <div className="auth-heading">
          <h1>Welcome Back!</h1>
          <p>Continue your coding adventure.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label>Email Address</label>

          <div className="auth-input">
            <Mail size={19} />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <label>Password</label>

          <div className="auth-input">
            <Lock size={19} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          {error && (
            <p className="auth-error">{error}</p>
          )}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login to CodeQuest"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?
          <Link to="/signup"> Create Account</Link>
        </p>

        <Link to="/" className="back-home">
          ← Back to Home
        </Link>

      </div>
    </div>
  );
}

export default Login;
