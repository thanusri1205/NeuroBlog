import React, { useState } from "react";
import "./ViewBlog.css";

const BLOGS = [
  {
    id: 1,
    title: "Travel Blog 1",
    summary: "Exploring the mountains...",
    category: "travel",
    likes: 120,
    content: "Full content for Travel Blog 1. It can include text, images, or anything else related to the post.",
    meta: "👤 Posted by User123 | 👁 500 Views | ❤ 120 Likes",
  },
  {
    id: 2,
    title: "Education Blog 1",
    summary: "Tips for better studying...",
    category: "educational",
    likes: 80,
    content: "Full content for Education Blog 1. It can include text, images, or anything else related to the post.",
    meta: "👤 Posted by User234 | 👁 200 Views | ❤ 80 Likes",
  },
  {
    id: 3,
    title: "Food Blog 1",
    summary: "Delicious recipes to try...",
    category: "food",
    likes: 150,
    content: "Full content for Food Blog 1. It can include text, images, or anything else related to the post.",
    meta: "👤 Posted by User345 | 👁 300 Views | ❤ 150 Likes",
  },
];

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "travel", label: "Travel" },
  { value: "educational", label: "Educational" },
  { value: "food", label: "Food" },
];

export default function ViewBlog() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalBlog, setModalBlog] = useState(null);
  const [comments, setComments] = useState([]);
  const [currentComment, setCurrentComment] = useState("");

  const filteredBlogs =
    selectedCategory === "all"
      ? BLOGS
      : BLOGS.filter((b) => b.category === selectedCategory);

  const openModal = (blog) => {
    setModalBlog(blog);
    setComments([]); // Fresh comments each time for simplicity; update for persistence if needed
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalBlog(null);
    setComments([]);
    setCurrentComment("");
  };

  const handleCategory = (cat) => setSelectedCategory(cat);

  const addComment = () => {
    if (currentComment.trim()) {
      setComments([...comments, currentComment]);
      setCurrentComment("");
    }
  };

  return (
    <div className="vb-bg">
      <div className="container">
        <h1>Explore Blogs</h1>
        {/* Categories */}
        <div className="categories">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              style={{
                background:
                  selectedCategory === cat.value
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0,0,0,0.4)",
              }}
              onClick={() => handleCategory(cat.value)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Blogs grid */}
        <div className="blogs">
          {filteredBlogs.map((blog) => (
            <div
              key={blog.id}
              className="blog-card"
              data-category={blog.category}
              onClick={() => openModal(blog)}
            >
              <h3>{blog.title}</h3>
              <p>{blog.summary}</p>
              <span className="likes">
                ❤ {blog.likes} Likes
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Modal */}
      {modalOpen && modalBlog && (
        <div className="modal" style={{ display: "flex" }}>
          <div className="modal-content">
            <button className="close-btn" onClick={closeModal}>X</button>
            <h2 id="blogTitle">{modalBlog.title}</h2>
            <div className="meta">{modalBlog.meta}</div>
            <p>{modalBlog.content}</p>
            <div className="actions">
              <button>Like ❤</button>
              <button>Share 🔗</button>
            </div>
            {/* Comments */}
            <div className="comments">
              <h3>Comments</h3>
              <ul className="comment-list">
                {comments.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
              <div className="comment-input">
                <input
                  type="text"
                  placeholder="Write a comment..."
                  value={currentComment}
                  onChange={(e) => setCurrentComment(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addComment(); }}
                />
                <button onClick={addComment}>Post</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
