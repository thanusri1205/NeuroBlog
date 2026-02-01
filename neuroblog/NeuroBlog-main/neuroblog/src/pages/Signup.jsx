import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Signed up with: ${email}`);
    navigate("/home");
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
