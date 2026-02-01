import React, { useEffect, useState } from "react";
import "./ViewBlog.css";

export default function ViewBlog() {
  // Current logged-in user ID from localStorage
  const currentUserId = Number(localStorage.getItem("userId")) || 1;

  // States
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [loading, setLoading] = useState(true);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, [currentUserId]);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/posts");
      if (!res.ok) throw new Error("Network response was not ok");

      const posts = await res.json();

      console.log("Fetched posts from backend:", posts);

      // Filter posts for the current user
      const userBlogs = posts.filter(
        post => post.user_id.toString() === currentUserId.toString()
      );

      console.log("Filtered blogs for current user:", userBlogs);

      // Format for frontend display
      const formattedBlogs = userBlogs.map(post => ({
        id: post.id,
        title: post.title || "Untitled",
        content: post.content || "",
        user_id: post.user_id,
        timestamp: post.timestamp,
        likes: post.likes || 0,
        shares: post.shares || 0,
        author: `User ${post.user_id}`,
        date: post.timestamp
          ? new Date(post.timestamp).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })
          : "No date",
      }));

      setBlogs(formattedBlogs);
    } catch (err) {
      console.error("Error fetching blogs:", err);
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteBlog = async id => {
    const ok = window.confirm("Delete this blog?");
    if (!ok) return;

    try {
      await fetch(`http://127.0.0.1:8000/posts/${id}?user_id=${currentUserId}`, {
        method: "DELETE",
      });
      setSelectedBlog(null);
      setIsEditing(false);
      fetchBlogs();
    } catch (err) {
      console.error("Error deleting blog:", err);
    }
  };

  const saveEdit = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/posts/${selectedBlog.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle,
          content: editContent,
          user_id: currentUserId,
        }),
      });

      if (!res.ok) throw new Error("Update failed");

      let updatedBlog;
      try {
        updatedBlog = await res.json();
      } catch {
        updatedBlog = { ...selectedBlog, title: editTitle, content: editContent };
      }

      setBlogs(prev => prev.map(b => (b.id === updatedBlog.id ? updatedBlog : b)));
      setSelectedBlog(updatedBlog);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving blog:", err);
    }
  };

  return (
    <div className="vb-bg">
      <h1>My Blogs</h1>
      <p>You have {blogs.length} blog(s)</p> {/* Number of blogs for current user */}

      {/* VIEW TOGGLE */}
      <div className="view-toggle">
        <button
          className={viewType === "grid" ? "active" : ""}
          onClick={() => setViewType("grid")}
        >
          ⬛ Box View
        </button>
        <button
          className={viewType === "list" ? "active" : ""}
          onClick={() => setViewType("list")}
        >
          📄 Line View
        </button>
      </div>

      {/* BLOG LIST */}
      {loading ? (
        <p className="status">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <p className="status">No blogs created yet.</p>
      ) : (
        <div className={`blogs ${viewType}`}>
          {blogs.map(blog => (
            <div
              key={blog.id}
              className="blog-card"
              onClick={() => {
                setSelectedBlog(blog);
                setIsEditing(false);
              }}
            >
              <h3>{blog.title}</h3>
              <p>{blog.content?.slice(0, 120)}...</p>
              <div className="stats">
                ❤️ {blog.likes} &nbsp;&nbsp; 🔁 {blog.shares}
              </div>
              <div className="author-date">
                {blog.author} | {blog.date}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {selectedBlog && (
        <div className="modal">
          <div className="modal-content">
            <button
              className="close-btn"
              onClick={() => {
                setSelectedBlog(null);
                setIsEditing(false);
              }}
            >
              ✖
            </button>

            {isEditing ? (
              <div className="edit-form">
                <div>
                  <label>Title</label>
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                </div>
                <div>
                  <label>Content</label>
                  <textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    rows={6}
                  />
                </div>
                <div className="actions">
                  <button onClick={saveEdit}>Save</button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditTitle(selectedBlog.title);
                      setEditContent(selectedBlog.content);
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>{selectedBlog.title}</h2>
                <p>{selectedBlog.content}</p>
                <div className="stats">
                  ❤️ {selectedBlog.likes} &nbsp;&nbsp; 🔁 {selectedBlog.shares}
                </div>
                <div className="author-date">
                  {selectedBlog.author} | {selectedBlog.date}
                </div>
                <div className="actions">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditTitle(selectedBlog.title);
                      setEditContent(selectedBlog.content);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => deleteBlog(selectedBlog.id)}>Delete</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
