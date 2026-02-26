import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Signup.css";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({});
  const navigate = useNavigate();

  // 🔐 Password validation function
  const validatePassword = (password) => {
    const minLength = /.{8,}/;
    const upperCase = /[A-Z]/;
    const lowerCase = /[a-z]/;
    const number = /[0-9]/;
    const specialChar = /[!@#$%^&*(),.?":{}|<>]/;

    return {
      minLength: minLength.test(password),
      upperCase: upperCase.test(password),
      lowerCase: lowerCase.test(password),
      number: number.test(password),
      specialChar: specialChar.test(password),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ Check password strength before API call
    const rules = validatePassword(password);

    const isValid =
      rules.minLength &&
      rules.upperCase &&
      rules.lowerCase &&
      rules.number &&
      rules.specialChar;

    if (!isValid) {
      setError("Password does not meet security requirements.");
      return;
    }

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

      // ✅ Keep your existing functionality intact
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("username", data.username);
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("userEmail", data.email);

      setSuccess(true);

      setTimeout(() => {
        navigate("/login");
      }, 2000);

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
          <h1>Join Neuroblog Today!</h1>
          <p>Create your account to start sharing ideas, writing blogs, and connect.</p>
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
                onChange={(e) => {
                  const value = e.target.value;
                  setPassword(value);
                  setPasswordValidation(validatePassword(value));
                }}
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

            {/* 🔐 Password Rules UI */}
            <div className="password-rules">
              <p className={passwordValidation.minLength ? "valid" : ""}>
                ✔ At least 8 characters
              </p>
              <p className={passwordValidation.upperCase ? "valid" : ""}>
                ✔ One uppercase letter
              </p>
              <p className={passwordValidation.lowerCase ? "valid" : ""}>
                ✔ One lowercase letter
              </p>
              <p className={passwordValidation.number ? "valid" : ""}>
                ✔ One number
              </p>
              <p className={passwordValidation.specialChar ? "valid" : ""}>
                ✔ One special character
              </p>
            </div>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">✅ Signup successful! Redirecting...</p>}

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

        </div>
      </div>
    </div>
  );
}