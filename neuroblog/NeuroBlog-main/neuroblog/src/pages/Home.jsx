import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  // Dropdown logic: Toggle dropdown on profile icon click
  React.useEffect(() => {
    const profileIcon = document.getElementById('profileIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');
    if (!profileIcon || !dropdownMenu) return;

    const toggleDropdown = (e) => {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    };

    const closeDropdown = (e) => {
      if (!dropdownMenu.contains(e.target) && e.target !== profileIcon) {
        dropdownMenu.style.display = "none";
      }
    };

    profileIcon.addEventListener('click', toggleDropdown);
    window.addEventListener('click', closeDropdown);

    return () => {
      profileIcon.removeEventListener('click', toggleDropdown);
      window.removeEventListener('click', closeDropdown);
    };
  }, []);

  return (
    <div className="home-bg">
      <header>
        <div className="logo">MyBlog</div>
        <div className="search-container">
          <input type="text" placeholder="Search blogs..." className="search-bar" />
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" stroke="white" strokeWidth="2" fill="none"/>
            <line x1="17" y1="17" x2="22" y2="22" stroke="white" strokeWidth="2"/>
          </svg>
        </div>
        <div className="icons">
          <button className="create-btn" onClick={() => navigate("/create")}>Create</button>
          {/* Notifications Bell */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
          </svg>
          {/* Profile Icon and Dropdown */}
          <div className="profile">
            <svg id="profileIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <circle cx="12" cy="7" r="4"/>
              <path d="M5.5 21a8.38 8.38 0 0113 0"/>
            </svg>
            <div className="dropdown" id="dropdownMenu">
              <button className="dropdown-link" onClick={() => navigate("/profile")}>
                My Profile
              </button>
              <button className="dropdown-link" onClick={() => navigate("/settings")}>
                Settings
              </button>
              <button className="dropdown-link" onClick={() => navigate("/")}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        <h1>Welcome to MyBlog Platform</h1>
        <p>View, create, and explore amazing blogs with ease.</p>

        <div className="content-wrapper">
          {/* Popular Blogs */}
          <div className="popular-blogs">
            <h2>🔥 Popular Blogs</h2>
            <div className="blog">
              <h3>10 Tips for Better Writing</h3>
              <p>by John Doe | Aug 20</p>
              <p>Learn how to improve your writing with these proven techniques...</p>
            </div>
            <div className="blog">
              <h3>Traveling the World on a Budget</h3>
              <p>by Sarah Lee | Aug 18</p>
              <p>Discover how to explore amazing destinations without breaking the bank...</p>
            </div>
            <div className="blog">
              <h3>Mastering Web Development in 2025</h3>
              <p>by Alex Kim | Aug 15</p>
              <p>Stay ahead of the curve with these web dev trends and tips...</p>
            </div>
          </div>
          {/* Side Features */}
          <div className="side-features">
            <div className="feature-card">
              <h2>About Our Website</h2>
              <p>
                A platform where creativity meets ideas. Share your thoughts, connect with readers, and grow your influence.
              </p>
            </div>
            <div className="feature-card">
              <h2>Followed Bloggers</h2>
              <p>Keep track of the bloggers you follow and never miss their latest posts.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
