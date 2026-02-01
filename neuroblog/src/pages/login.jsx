import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: email, // OAuth2PasswordRequestForm expects 'username'
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.detail ||
            data.message ||
            "Invalid credentials. Please sign up first."
        );
        return;
      }

      // Save JWT token to localStorage
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.user_id);

      // Navigate to home page
      navigate("/home");
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="login-bg">
      <div className="login-container">
        <div className="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="12" cy="7" r="5" />
            <path d="M12 14c-5 0-9 2.5-9 5.5V22h18v-2.5c0-3-4-5.5-9-5.5z" />
          </svg>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <label htmlFor="email">Email ID</label>
            <input
              type="email"
              id="email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-box">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="btn">
            LOGIN
          </button>

          {/* ✅ ERROR MESSAGE BELOW LOGIN BUTTON */}
          {error && (
  <div className="login-error">
    <p>{error}</p>
    <span onClick={() => navigate("/signup")}>
      Don’t have an account? Sign up
    </span>
  </div>
)}

        </form>
      </div>
    </div>
  );
}
