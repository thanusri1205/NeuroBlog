import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  /* ================= SEARCH STATE ================= */
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [blogs, setBlogs] = useState([]);

  /* ================= 🔔 NOTIFICATION STATE ================= */
  const [notifications, setNotifications] = useState([]);

  /* ================= DEBOUNCE LOGIC ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  /* ================= FETCH BLOGS ================= */
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/posts?search=${debouncedSearch}`)
      .then(res => res.json())
      .then(data => setBlogs(data))
      .catch(err => console.error(err));
  }, [debouncedSearch]);

  /* ================= 🔔 FETCH NOTIFICATIONS ================= */
  const fetchNotifications = () => {
    fetch("http://127.0.0.1:8000/notifications/recent-posts")
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* 🔥 AUTO REFRESH EVERY 10 SECONDS */
  useEffect(() => {
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  /* ================= CLOSE ON OUTSIDE CLICK ================= */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= TIME AGO FUNCTION ================= */
  const timeAgo = (timestamp) => {
    const diff = Math.floor((new Date() - new Date(timestamp)) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff} min ago`;
    return `${Math.floor(diff / 60)} hr ago`;
  };

  /* ================= JSX ================= */
  return (
    <div className="home-bg">
      <header>
        <div className="logo">Neuroblog</div>

        {/* ================= SEARCH BAR ================= */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search blogs..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ================= ICONS ================= */}
        <div className="icons" ref={menuRef}>
          <button className="create-btn" onClick={() => navigate("/create")}>
            Create
          </button>

          {/* 🔔 NOTIFICATIONS */}
          <div className="notification-wrapper">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(
                  openMenu === "notifications" ? null : "notifications"
                );
              }}
              style={{ cursor: "pointer" }}
            >
              <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            {/* 🔴 Notification Count */}
            {notifications.length > 0 && (
              <span className="notification-badge">
                {notifications.length}
              </span>
            )}

            {openMenu === "notifications" && (
              <div className="notification-dropdown">
                <h4><b><center>Recent Posts</center></b></h4>

                {notifications.map((post) => (
                  <div
                    key={post.id}
                    className="notification-item unread"
                    onClick={() => navigate(`/blog/${post.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    
                    <div>
                      <p>
                        <strong>{post.title}</strong>
                      </p>
                      <small>
                        by {post.username} • {timeAgo(post.timestamp)}
                      </small>
                      <span>📝</span>
                    </div>
                  </div>
                  
                ))}

                {notifications.length === 0 && (
                  <p style={{ textAlign: "center" }}>
                    No recent posts
                  </p>
                )}
              </div>
            )}
          </div>

          {/* 👤 PROFILE */}
          <div className="profile" onClick={(e) => e.stopPropagation()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              onClick={(e) => {
                e.stopPropagation();
                setOpenMenu(openMenu === "profile" ? null : "profile");
              }}
              style={{ cursor: "pointer" }}
            >
              <circle cx="12" cy="7" r="4" />
              <path d="M5.5 21a8.38 8.38 0 0113 0" />
            </svg>

            {openMenu === "profile" && (
              <div className="dropdown">
                <button onClick={() => navigate("/profile")}>My Profile</button>
                <button onClick={() => navigate("/view")}>My Blogs</button>
                <button onClick={() => navigate("/settings")}>Settings</button>
                <button onClick={() => navigate("/")}>Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <div className="main-content">
        <h1>Welcome to MyBlog Platform</h1>
        <p>View, create, and explore amazing blogs with ease.</p>

        <div className="content-wrapper">
          <div className="popular-blogs">
            <h2>🔥 Blogs</h2>

            {blogs.map((blog) => {
              const imgMatch = blog.content.match(/<img[^>]+src="([^">]+)"/);
              const firstImage = imgMatch ? imgMatch[1] : null;
              const textOnly = blog.content.replace(/<img[^>]*>/g, "");

              return (
                <div
                  key={blog.id}
                  className="home-blog-card"
                  onClick={() => navigate(`/blog/${blog.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {firstImage && (
                    <div className="home-thumbnail">
                      <img src={firstImage} alt="thumbnail" />
                    </div>
                  )}

                  <div className="home-blog-content">
                    <h3>{blog.title}</h3>

                    <div
                      dangerouslySetInnerHTML={{
                        __html: textOnly.slice(0, 120) + "..."
                      }}
                    />

                    <small>
                      {blog.username} •{" "}
                      {new Date(blog.timestamp).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              );
            })}

            {blogs.length === 0 && (
              <p style={{ textAlign: "center", marginTop: "20px" }}>
                No blogs found.
              </p>
            )}
          </div>

          <div className="side-features">
            <div className="feature-card">
              <h2>About Our Website</h2>
              <p>
                MyBlog is a modern blogging platform where creativity meets innovation — share ideas, explore topics, and connect with readers worldwide.
🚀 Our integrated AI Blog Generator helps you create engaging blogs instantly and effortlessly.
              </p>
            </div>

            <div className="feature-card">
              <h2>Start Writing Today</h2>
              <p>
                Share your thoughts, showcase your knowledge, and inspire others.

              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}