import React from "react";
import { useNavigate } from "react-router-dom";
import "./Main.css";

export default function Main() {
  const navigate = useNavigate();

  return (
    <div className="main-bg">
      <header>
        <div className="logo">BlogSphere</div>
        <nav>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <button className="btn" onClick={() => navigate("/login")}>
            Signin
          </button>
          <button className="btn" onClick={() => navigate("/signup")}>
            Signup
          </button>
        </nav>
      </header>
      <section className="hero">
        <img
          src="https://cdn-icons-png.flaticon.com/512/2920/2920244.png"
          alt="Blog illustration"
        />
        <h1>Start Your Blog Today</h1>
        <p>
          A creative space to write, read, and share your stories with the world.
        </p>
      </section>
      <section id="about">
        <h2>About the Website</h2>
        <p>
          BlogSphere is a simple and modern blogging platform where you can
          publish your thoughts, tutorials, and ideas. It combines ease of use
          with elegant motion effects for a delightful experience.
        </p>
      </section>
      <section id="contact">
        <h2>Contact Us</h2>
        <p>Email: support@blogsphere.com</p>
        <p>Phone: +91-9876543210</p>
      </section>
      <footer>© 2025 BlogSphere — Built with ♥</footer>
    </div>
  );
}
