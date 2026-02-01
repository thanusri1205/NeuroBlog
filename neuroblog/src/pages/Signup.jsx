import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || data.message || "Signup failed");
        return;
      }

      // Save JWT token in localStorage
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
    <div className="signup-bg">
      <div className="container">
        {/* Left section */}
        <div className="left">
          <div className="circle one"></div>
          <div className="circle two"></div>
          <div className="circle three"></div>
          <h1>Welcome Back!</h1>
          <p>Sign in to access your account and explore new content.</p>
        </div>
        {/* Right section */}
        <div className="right">
          <h2>Sign Up</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="input-box password-box">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" className="btn">
              Sign Up
            </button>
          </form>
          <div className="text-link">
            Already have an account?{" "}
            <Link to="/login" className="link-action">
              Sign in
            </Link>
          </div>
          <div className="social">
            <p>Or Sign In with</p>
            <button className="google">Google</button>
          </div>
        </div>
      </div>
    </div>
  );
}
