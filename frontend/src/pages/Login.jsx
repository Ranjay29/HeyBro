import { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import splash from "../assets/splash.png";
import "./Auth.css";

export default function Login({ onLogin, userData }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

  const navigate = useNavigate();

  // if already logged in, redirect
  useEffect(() => {
    if (userData?.mobile && !localStorage.getItem("mobile")) {
      localStorage.setItem("mobile", userData.mobile);
      navigate("/dashboard");
    }
  }, [userData]);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("All fields are required");
      return;
    }

      setShowSplash(true);
      setLoading(true);

    try {
      const res = await axios.post("/auth/login", {
        email: email.trim(),
        password: password
      });

      // ✅ Store real JWT
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("mobile", res.data.mobile);


      // Wait 3 seconds then redirect
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (showSplash) {
    return (
      <div className="splash-container">
        <img src={splash} alt="HeyBro Loading..." className="splash-gif" />
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Welcome Back 👋</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"}      // toggle type
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button onClick={handleLogin} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p>
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
}