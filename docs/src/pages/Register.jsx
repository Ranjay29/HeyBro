import { useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate, Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // 👈 FontAwesome icons
import "./Auth.css";

export default function Register() {
  const [user, setUser] = useState({ name: "", email: "", password: "", mobile: "" });
  const [showPassword, setShowPassword] = useState(false); // 👈 new state

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post("/auth/register", user);
      alert("Registration successful!");
      navigate("/");
    } catch (error) {
      alert("Registration failed!");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>

        <input
          type="text"
          name="name"
          value={user.name}
          placeholder="Full Name"
          onChange={e => setUser({ ...user, name: e.target.value })}
        />

        <input
          type="email"
          name="email"
          value={user.email}
          placeholder="Email"
          onChange={e => setUser({ ...user, email: e.target.value })}
        />

        <input
          type="text"
          name="mobile"
          value={user.mobile}
          placeholder="Mobile"
          onChange={e => setUser({ ...user, mobile: e.target.value })}
        />

        <div className="password-wrapper">
          <input
            type={showPassword ? "text" : "password"} // 👈 toggle type
            name="password"
            value={user.password}
            placeholder="Password"
            onChange={e => setUser({ ...user, password: e.target.value })}
          />
          <span
            className="toggle-password"
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>

        <button onClick={handleRegister}>Register</button>

        <p>
          Already have an account? <Link to="/">Login</Link>
        </p>
      </div>
    </div>
  );
}