import { useState, useEffect } from "react";

export default function BlogCard({ blog }) {

  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/posts/${blog.id}/reactions`)
      .then(res => res.json())
      .then(data => {
        setLikes(data.likes);
        setDislikes(data.dislikes);
      });

    fetch(`http://127.0.0.1:8000/posts/${blog.id}/comments`)
      .then(res => res.json())
      .then(data => setComments(data));

  }, [blog.id]);

  function handleReaction(type) {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/posts/${blog.id}/react?reaction_type=${type}`, {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token
      }
    })
    .then(() => {
      if (type === "like") setLikes(prev => prev + 1);
      else setDislikes(prev => prev + 1);
    });
  }

  function handleComment() {
    const token = localStorage.getItem("token");

    fetch(`http://127.0.0.1:8000/posts/${blog.id}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ content: newComment })
    })
    .then(res => res.json())
    .then(data => {
      setComments(prev => [data, ...prev]);
      setNewComment("");
    });
  }

  return (
    <div className="blog-card">

      <h3>{blog.title}</h3>
      <p>{blog.content}</p>
      <small>{blog.username}</small>

      <div className="reaction-section">
        <button onClick={() => handleReaction("like")}>
          👍 {likes}
        </button>

        <button onClick={() => handleReaction("dislike")}>
          👎 {dislikes}
        </button>
      </div>

      <div className="comment-section">
        <input
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add comment..."
        />
        <button onClick={handleComment}>Post</button>

        {comments.map(c => (
          <div key={c.id}>
            <strong>{c.username}</strong>
            <p>{c.content}</p>
          </div>
        ))}
      </div>

    </div>
  );
}