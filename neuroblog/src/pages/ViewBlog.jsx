import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import "./ViewBlog.css";

// ================= QUILL TOOLBAR =================
const modules = {
  toolbar: [
    [{ font: [] }],
    [{ size: ["small", false, "large", "huge"] }],
    ["bold", "italic", "underline", "strike"],
    [{ color: [] }, { background: [] }],
    [{ align: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
    ["clean"]
  ]
};

export default function ViewBlog() {

  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [viewType, setViewType] = useState("grid");
  const [loading, setLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // ================= FETCH POSTS =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://127.0.0.1:8000/my-posts", {
      headers: {
        "Authorization": "Bearer " + token
      }
    })
      .then(res => res.json())
      .then(data => {
        const formatted = data.map(post => ({
          id: post.id,
          title: post.title || "Untitled",
          author: post.username,
          date: post.timestamp
            ? new Date(post.timestamp).toLocaleDateString()
            : "No date",
          content: post.content
        }));

        setPosts(formatted);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

  }, []);

  // ================= UPDATE BLOG =================
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/posts/${editingPost.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          body: JSON.stringify({
            title: editTitle,
            content: editContent
          })
        }
      );

      const updatedPost = await response.json();

      const updatedFormatted = {
        id: updatedPost.id,
        title: updatedPost.title,
        author: updatedPost.username,
        date: updatedPost.timestamp
          ? new Date(updatedPost.timestamp).toLocaleDateString()
          : "No date",
        content: updatedPost.content
      };

      setPosts(posts.map(p =>
        p.id === updatedFormatted.id ? updatedFormatted : p
      ));

      setIsEditing(false);
      setEditingPost(null);
      setSelectedPost(updatedFormatted);

    } catch (error) {
      console.error(error);
    }
  };

  // ================= DELETE BLOG =================
  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    if (!window.confirm("Delete this blog?")) return;

    try {
      await fetch(`http://127.0.0.1:8000/posts/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });

      setPosts(posts.filter(post => post.id !== id));
      setSelectedPost(null);

    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="vb-bg">
      <h1>My Blogs</h1>
      <p>You have {posts.length} blog(s)</p>

      {/* ================= VIEW TOGGLE ================= */}
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

      {/* ================= BLOG LIST ================= */}
      {loading ? (
        <p className="status">Loading blogs...</p>
      ) : posts.length === 0 ? (
        <p className="status">No blogs created yet.</p>
      ) : (
        <div className={`blogs ${viewType}`}>
          {posts.map((blog) => {

            const imgMatch = blog.content.match(/<img[^>]+src="([^">]+)"/);
            const firstImage = imgMatch ? imgMatch[1] : null;
            const textOnly = blog.content.replace(/<img[^>]*>/g, "");

            return (
              <div
                key={blog.id}
                className="blog-card-box"
                onClick={() => {
                  setSelectedPost(blog);
                  setIsEditing(false);
                }}
              >
                {firstImage && (
                  <div className="box-image">
                    <img src={firstImage} alt="thumbnail" />
                  </div>
                )}

                <div className="box-content">
                  <h3>{blog.title}</h3>

                  <div
                    className="box-preview blog-content"
                    dangerouslySetInnerHTML={{
                      __html: textOnly.slice(0, 120) + "..."
                    }}
                  />

                  <div className="blog-meta">
                    {blog.author} • {blog.date}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL ================= */}
      {selectedPost && (
        <div className="modal">
          <div className="modal-content">

            <button
              className="close-btn"
              onClick={() => {
                setSelectedPost(null);
                setIsEditing(false);
              }}
            >
              ✖
            </button>

            {isEditing ? (
              <div className="edit-form">
                <label>Title</label>
                <input
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                />

                <label>Content</label>

                {/* 🔥 REPLACED TEXTAREA WITH REACTQUILL */}
                <ReactQuill
                  theme="snow"
                  value={editContent}
                  onChange={setEditContent}
                  modules={modules}
                />

                <div className="actions">
                  <button onClick={handleUpdate}>Save</button>
                  <button onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2>{selectedPost.title}</h2>

                <div
                  className="blog-content"
                  dangerouslySetInnerHTML={{
                    __html: selectedPost.content
                  }}
                />

                <div className="blog-meta">
                  {selectedPost.author} • {selectedPost.date}
                </div>

                <div className="actions">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setEditingPost(selectedPost);
                      setEditTitle(selectedPost.title);
                      setEditContent(selectedPost.content);
                    }}
                  >
                    Edit
                  </button>

                  <button onClick={() => handleDelete(selectedPost.id)}>
                    Delete
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}