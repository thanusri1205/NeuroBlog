import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill-new";
import "quill/dist/quill.snow.css";
import "./CreateBlog.css";

// ================= ADVANCED TOOLBAR =================
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

const formats = [
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "color",
  "background",
  "align",
  "list",
  "link",
  "image"
];

// ================= LLM FUNCTION =================
async function sendPromptToLLM(prompt) {
  const response = await fetch("http://127.0.0.1:8000/generate-blog", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    throw new Error("Failed to generate blog");
  }

  const data = await response.json();
  return data.generated_text || "No response from LLM";
}

export default function CreateBlog() {

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [publishMsg, setPublishMsg] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // AI STATES
  const [prompt, setPrompt] = useState("");
  const [generatedBlog, setGeneratedBlog] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);

  // ================= FETCH USER POSTS =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/my-posts", {
      headers: { Authorization: "Bearer " + token }
    })
      .then(res => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then(data => {
        const latestOne = data.slice(0, 1);

        const formatted = latestOne.map(post => ({
          id: post.id,
          title: post.title || "Untitled",
          author: post.username,
          date: post.timestamp
            ? new Date(post.timestamp).toLocaleDateString()
            : "No date",
          content: post.content
        }));

        setBlogs(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  // ================= CORRECT WORD COUNT (DOM PARSING) =================
  useEffect(() => {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = content;

    const text = tempDiv.textContent || tempDiv.innerText || "";

    const words = text.trim().length === 0
      ? 0
      : text.trim().split(/\s+/).length;

    setWordCount(words);
  }, [content]);

  // ================= AI GENERATE =================
  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setLoadingAI(true);
    setGeneratedBlog("");

    try {
      const generatedText = await sendPromptToLLM(prompt);

      // ❌ DO NOT TOUCH content
      // setContent(generatedText)  ← intentionally removed

      // ✅ ONLY update AI output
      setGeneratedBlog(generatedText);

    } catch (error) {
      console.error("Generation failed", error);
      setGeneratedBlog("❌ Failed to generate blog");
    }

    setLoadingAI(false);
  };

  // ================= PUBLISH =================
  async function handlePublish() {

    if (!title.trim()) {
      setPublishMsg("❌ Please enter a title");
      return;
    }

    if (!content.trim() || content === "<p><br></p>") {
      setPublishMsg("❌ Please write your blog before publishing!");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setPublishMsg("❌ You must login first.");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + token
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      const savedPost = await response.json();

      const newBlog = {
        id: savedPost.id,
        title: savedPost.title || "Untitled",
        author: savedPost.username,
        date: savedPost.timestamp
          ? new Date(savedPost.timestamp).toLocaleDateString()
          : "No date",
        content: savedPost.content
      };

      setBlogs([newBlog]);

      setPublishMsg("🎉 Blog published successfully!");
      setTitle("");
      setContent("");

      setTimeout(() => setPublishMsg(""), 3000);

    } catch (err) {
      console.error(err);
      setPublishMsg("❌ Failed to publish blog");
    }
  }

  // ================= UI =================
  return (
    <div className="create-bg">
    <div className="create-page">
      <div className="create-wrapper">
        <div className="create-grid">

          {/* LEFT SIDE */}
          <div className="manual-section">

            <input
              className="title-input"
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              style={{ height: "300px", marginBottom: "50px" }}
            />

            <div className="word-count">
              {wordCount} word{wordCount !== 1 ? "s" : ""}
            </div>

            <button className="publish-btn" onClick={handlePublish}>
              Publish Blog
            </button>

            {publishMsg && <div className="publish-msg">{publishMsg}</div>}

          </div>

          {/* RIGHT SIDE - AI CARD */}
          <div className="ai-section">
            <h4>🤖 AI Blog Generator</h4>

            <textarea
              placeholder="Enter prompt..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="ai-prompt"
            />

            <button
              onClick={handleGenerate}
              className="generate-btn"
              disabled={loadingAI}
            >
              {loadingAI ? "Generating..." : "Generate"}
            </button>

            {generatedBlog && (
              <>
                <div className="ai-output">
                  {generatedBlog}
                </div>

                <button
                  onClick={() => setContent(generatedBlog)}
                  className="generate-btn"
                  style={{ marginTop: "10px" }}
                >
                  Insert Into Editor
                </button>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
    </div>
  );
}