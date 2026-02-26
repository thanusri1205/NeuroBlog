import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./BlogDetails.css";

export default function BlogDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [allIds, setAllIds] = useState([]);

  /* ================= REACTION STATES ================= */
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);

  /* ================= COMMENT STATES ================= */
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  /* ✅ COMMENT COUNT STATE (NEW) */
  const [commentCount, setCommentCount] = useState(0);

  /* ✅ EDIT MODE STATE */
  const [editingId, setEditingId] = useState(null);

  /* ✅ CURRENT USER STATE */
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const username = localStorage.getItem("username");
    setCurrentUser(username);
  }, []);

  // ================= FETCH BLOG =================
  useEffect(() => {
    fetch(`http://localhost:8000/posts/${id}`)
      .then(res => res.json())
      .then(data => setBlog(data))
      .catch(err => console.error(err));
  }, [id]);

  // ================= FETCH IDS =================
  useEffect(() => {
    fetch("http://localhost:8000/posts/ids")
      .then(res => res.json())
      .then(data => setAllIds(data))
      .catch(err => console.error(err));
  }, []);

  // ================= FETCH REACTIONS =================
  const fetchReactions = () => {
    fetch(`http://localhost:8000/posts/${id}/reactions`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.likes);
        setDislikes(data.dislikes);
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchReactions();
  }, [id]);

  // ================= FETCH COMMENTS =================
  const fetchComments = () => {
    fetch(`http://localhost:8000/posts/${id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchComments();
  }, [id]);

  // ✅ ================= FETCH COMMENT COUNT (NEW) =================
  const fetchCommentCount = () => {
    fetch(`http://localhost:8000/posts/${id}/comments/count`)
      .then(res => res.json())
      .then(data => setCommentCount(data.count))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCommentCount();
  }, [id]);

  // ================= LIKE =================
  const handleLike = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/react?is_like=true`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchReactions();
  };

  // ================= DISLIKE =================
  const handleDislike = async () => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/react?is_like=false`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchReactions();
  };

  // ================= ADD COMMENT =================
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/posts/${id}/comments?content=${encodeURIComponent(newComment)}`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setNewComment("");
    fetchComments();
    fetchCommentCount(); // ✅ update count after adding
  };

  // ================= DELETE COMMENT =================
  const handleDelete = async (commentId) => {
    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/comments/${commentId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    fetchComments();
    fetchCommentCount(); // ✅ update count after delete
  };

  // ================= UPDATE COMMENT =================
  const handleUpdate = async (commentId) => {
    if (!newComment.trim()) return;

    const token = localStorage.getItem("token");

    await fetch(
      `http://localhost:8000/comments/${commentId}?content=${encodeURIComponent(newComment)}`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    setEditingId(null);
    setNewComment("");
    fetchComments();
  };

  // ================= NAVIGATION =================
  const currentIndex = allIds.indexOf(parseInt(id));
  const hasNext = currentIndex < allIds.length - 1;
  const hasPrevious = currentIndex > 0;

  const goLeft = () => {
    if (hasNext) navigate(`/blog/${allIds[currentIndex + 1]}`);
    else navigate("/home");
  };

  const goRight = () => {
    if (hasPrevious) navigate(`/blog/${allIds[currentIndex - 1]}`);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") goLeft();
      if (e.key === "ArrowRight" && hasPrevious) goRight();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, allIds]);

  if (!blog) return <div>Loading...</div>;

  return (
    <div className="blog-details-container">

      <button className="home-button" onClick={() => navigate("/home")}>
        🏠
      </button>

      <button className="arrow left-arrow" onClick={goLeft}>
        ←
      </button>

      <button
        className={`arrow right-arrow ${!hasPrevious ? "disabled" : ""}`}
        onClick={goRight}
        disabled={!hasPrevious}
      >
        →
      </button>

      <div className="blog-details-card">
        <h1>{blog.title}</h1>

        <div className="blog-meta">
          {blog.username} • {new Date(blog.timestamp).toLocaleDateString()}
        </div>

        <hr />

        <div
          className="blog-full-content"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* LIKE / DISLIKE */}
        <div style={{ marginTop: "20px" }}>
          <button onClick={handleLike}>👍 {likes}</button>
          <button onClick={handleDislike} style={{ marginLeft: "10px" }}>
            👎 {dislikes}
          </button>
        </div>

        {/* COMMENTS */}
        <hr />

        {/* ✅ UPDATED HEADER */}
        <h3 style={{ marginTop: "20px" }}>
          Comments ({commentCount})
        </h3>

        {/* ADD COMMENT */}
        <div style={{ marginTop: "10px" }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{ width: "70%", padding: "8px" }}
          />
          <button
            onClick={handleAddComment}
            style={{ marginLeft: "10px", padding: "8px 12px" }}
          >
            Post
          </button>
        </div>

        {/* COMMENT LIST */}
        <div style={{ marginTop: "20px" }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{ marginBottom: "15px" }}>
              <strong>{comment.username}</strong>

              {comment.username === currentUser && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: "red",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Delete
                </button>
              )}

              {editingId === comment.id ? (
                <>
                  <input
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    style={{ marginTop: "5px", padding: "5px" }}
                  />
                  <button
                    onClick={() => handleUpdate(comment.id)}
                    style={{ marginLeft: "5px" }}
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p style={{ margin: "5px 0" }}>{comment.content}</p>

                  {comment.username === currentUser && (
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setNewComment(comment.content);
                      }}
                      style={{
                        fontSize: "12px",
                        background: "none",
                        border: "none",
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}