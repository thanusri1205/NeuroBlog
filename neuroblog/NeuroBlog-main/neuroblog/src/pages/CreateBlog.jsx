import React, { useRef, useState } from "react";
import "./CreateBlog.css";

// --------- MISSING FUNCTION: Add this at the top ---------
async function sendPromptToLLM(prompt) {
  const response = await fetch('http://localhost:8000/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: prompt, max_new_tokens: 400 }),
  });
  const data = await response.json();
  return data.generated_text || "No response from LLM";
}
// ---------------------------------------------------------

const IMG1 = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80";
const IMG2 = "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80";

const FONT_FAMILIES = [
  "Arial", "Georgia", "Courier New", "Verdana", "Tahoma", "Times New Roman",
  "Trebuchet MS", "Impact", "Comic Sans MS", "Lucida Console", "Garamond",
  "Palatino Linotype", "Segoe UI", "Roboto", "Noto Sans", "Montserrat", "Open Sans"
];
const FONT_SIZES = [
  "8px","9px","10px","11px","12px","14px","16px","18px",
  "20px","22px","24px","26px","28px","32px","36px","40px",
  "44px","48px","56px","64px","72px"
];
const SIZE_MAP = {
  "8px":"1", "9px":"1", "10px":"2", "11px":"2", "12px":"3", "14px":"3", "16px":"4",
  "18px":"4", "20px":"5", "22px":"5", "24px":"6", "26px":"6", "28px":"7", "32px":"7",
  "36px":"7", "40px":"7", "44px":"7", "48px":"7", "56px":"7", "64px":"7", "72px":"7"
};

// Minimal cropper dialog
function CropperModal({ src, onCancel, onCrop }) {
  const canvasRef = useRef();
  const imgRef = useRef();
  const [crop, setCrop] = useState({ x: 30, y: 30, size: 180 });
  const [drag, setDrag] = useState(false);

  function drawCropBox() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    ctx.clearRect(0,0,300,300);
    if (img && img.complete) ctx.drawImage(img, 0, 0, 300, 300);
    ctx.save();
    ctx.strokeStyle = "#ff758c";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(crop.x, crop.y, crop.size, crop.size);
    ctx.restore();
  }
  React.useEffect(() => { drawCropBox(); });

  function handleCrop() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const temp = document.createElement('canvas');
    temp.width = crop.size;
    temp.height = crop.size;
    temp.getContext('2d').drawImage(canvas, crop.x, crop.y, crop.size, crop.size, 0, 0, crop.size, crop.size);
    onCrop(temp.toDataURL("image/png"));
  }
  function onImgLoad() { drawCropBox(); }
  function handleMouseDown(e) {
    setDrag(true);
    const startX = e.clientX, startY = e.clientY, orig = { ...crop };
    function move(ev) {
      if (!drag) return;
      const nx = Math.min(Math.max(orig.x + ev.clientX - startX, 0), 300-crop.size);
      const ny = Math.min(Math.max(orig.y + ev.clientY - startY, 0), 300-crop.size);
      setCrop(c => ({ ...c, x: nx, y: ny }));
    }
    function up() { setDrag(false); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);}
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }
  return (
    <div className="blog-modal-overlay" style={{background:"rgba(60,48,90,0.89)"}} onClick={onCancel}>
      <div className="crop-modal-content" onClick={e=>e.stopPropagation()}>
        <h2>Crop Image</h2>
        <canvas ref={canvasRef} width={300} height={300}
          style={{border:"1.5px solid #ff758c", background:"#272245", borderRadius:"8px", cursor:"move"}}
          onMouseDown={handleMouseDown}
        />
        <img ref={imgRef} src={src} style={{display:"none"}} alt="To crop" onLoad={onImgLoad}/>
        <div className="crop-actions">
          <button onClick={handleCrop} className="publish-btn" style={{marginRight:18}}>Crop & Use</button>
          <button onClick={onCancel} className="close-modal-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Draggable modal
const BlogModal = ({ blog, onClose }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState(false);

  const startDrag = (e) => {
    setDrag(true);
    const startX = e.clientX, startY = e.clientY, orig = { ...pos };
    function move(ev) {
      if (!drag) return;
      const dx = ev.clientX - startX, dy = ev.clientY - startY;
      setPos({ x: orig.x + dx, y: orig.y + dy });
    }
    function up() { setDrag(false); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up);}
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  };
  return (
    <div className="blog-modal-overlay" onClick={onClose}>
      <div className="blog-modal-content" onClick={e => e.stopPropagation()}
        style={{position:'relative',left:pos.x,top:pos.y,cursor:drag?'move':'default'}}
      >
        <div
          style={{fontWeight:'bold', cursor:'grab', userSelect:'none', marginBottom:7, paddingBottom:8, borderBottom:"1px solid #e9c6ff30"}}
          onMouseDown={startDrag}
        >
          {blog.title}
        </div>
        <div className="blog-meta">by {blog.author} | {blog.date}</div>
        <div className="blog-text" dangerouslySetInnerHTML={{ __html: blog.content }} />
        {blog.images && blog.images.length > 0 &&
          <div className="blog-gallery">
            {blog.images.map((img, i) => (
              <img key={i} src={img} alt={`Blog img ${i + 1}`} />
            ))}
          </div>
        }
        <button className="close-modal-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default function CreateBlog() {
  const editorRef = useRef(null);
  const [wordCount, setWordCount] = useState(0);
  const [promptInput, setPromptInput] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [copied, setCopied] = useState(false);
  const [currentFont, setCurrentFont] = useState(FONT_FAMILIES[0]);
  const [currentFontSize, setCurrentFontSize] = useState(FONT_SIZES[6]);
  const [currentColor, setCurrentColor] = useState("#0e0d0d");
  const [blogs, setBlogs] = useState([
    {
      title: "Blogging for Beginners: A Complete Guide",
      author: "John Doe",
      date: "Aug 20",
      content:"Learn how to start blogging, build your audience, and succeed online.<br><br>" +
      "Starting a blog can seem overwhelming, but it’s an incredibly rewarding way to share your ideas, build connections, and sometimes even earn income. The key to success lies in choosing a niche you’re passionate about and consistently creating valuable content for your readers.<br><br>" +
      "This guide walks beginners through the essential steps: selecting the right blogging platform, designing an engaging site, and understanding SEO basics to attract an audience. Writing great blog posts that inform, entertain, or inspire will help you stand out and grow your community.<br><br>" +
      "With dedication and patience, blogging turns from a hobby into an opportunity. Whether you want to share personal stories or build a brand, this guide will help you craft a blog that reflects your unique voice and reaches a global audience.",
      images: [IMG1]
    },
    {
      title: "Travel Diaries: Exploring Japan",
      author: "Sarah Lee",
      date: "Aug 18",
      content: "Come along to Tokyo, Kyoto, and beyond in this visual journey through Japan.<br><br>" +
      "Explore the vibrant cityscapes, serene temples, and breathtaking natural beauty that make Japan a unique destination.<br><br>" +
      "Discover cultural traditions, mouth-watering cuisine, and the warmth of Japanese hospitality.<br><br>" +
      "Whether you're an avid traveler or planning your first trip, these travel diaries will inspire you to experience the Land of the Rising Sun like never before.",
      images: [IMG2]
    }
  ]);
  const [modalBlog, setModalBlog] = useState(null);
  const [publishMsg, setPublishMsg] = useState("");
  const [showCropper, setShowCropper] = useState(false);
  const [cropSrc, setCropSrc] = useState(null);

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
  };
  const handleFontFamily = (e) => {
    const font = e.target.value;
    setCurrentFont(font);
    execCommand("fontName", font);
  };
  const handleFontSize = (e) => {
    const size = e.target.value;
    setCurrentFontSize(size);
    const mappedSize = SIZE_MAP[size] || "3";
    execCommand("fontSize", mappedSize);
  };
  const handleColor = (e) => {
    const color = e.target.value;
    setCurrentColor(color);
    execCommand("foreColor", color);
  };
  const handleCommand = (cmd) => {
    execCommand(cmd);
  };
  const handleCreateLink = () => {
    const url = prompt("Enter the URL");
    if (url && url.trim() !== "") execCommand("createLink", url);
  };

  // Modern image insert+crop
  const handleInsertImage = () => {
    const input = document.createElement('input');
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          setCropSrc(evt.target.result);
          setShowCropper(true);
        };
        reader.readAsDataURL(e.target.files[0]);
      }
    };
    input.click();
  };

  function handleCropInsert(dataUrl) {
    setShowCropper(false);
    setCropSrc(null);
    execCommand("insertImage", dataUrl);
  }
  function handleCropCancel() {
    setShowCropper(false);
    setCropSrc(null);
  }

  const handleInput = () => {
    const text = editorRef.current.innerText.trim();
    const words = text.length === 0 ? 0 : text.split(/\s+/).length;
    setWordCount(words);
  };

  async function handleGeneratePrompt() {
    if (promptInput.trim() === "") {
      setGeneratedPrompt("Please enter a prompt");
      return;
    }
    setGeneratedPrompt("Loading...");
    setCopied(false);
    try {
      const result = await sendPromptToLLM(promptInput); // <-- must be defined at top!
      setGeneratedPrompt(result);
    } catch (error) {
      setGeneratedPrompt("Error generating prompt");
      console.error(error);
    }
    setPromptInput("");
  }
  function handlePromptKeyDown(e) {
    if (e.key === "Enter") handleGeneratePrompt();
  }
  function handleCopy() {
    if (generatedPrompt) {
      navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handlePublish() {
    const title = document.querySelector(".title-input").value.trim() || "Untitled Blog";
    const content = editorRef.current.innerHTML.trim();
    if (!content) {
      setPublishMsg("Please write your blog before publishing!");
      setTimeout(() => setPublishMsg(""), 2000);
      return;
    }
    const author = "You";
    const today = new Date();
    const date = today.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    const temp = document.createElement("div");
    temp.innerHTML = content;
    const imgs = Array.from(temp.querySelectorAll("img")).map(img => img.src).filter(x => !!x);
    const newBlog = { title, author, date, content, images: imgs };
    setBlogs([newBlog, ...blogs]);
    setPublishMsg("🎉 Blog published! Congratulations!");
    setTimeout(() => setPublishMsg(""), 3000);
    editorRef.current.innerHTML = "";
    document.querySelector(".title-input").value = "";
    setWordCount(0);
  }

  return (
    <div className="create-bg">
      <div className="responsive-stack">
        <div className="editor-container">
          <input className="title-input" placeholder="Enter blog title..." />
          <div className="toolbar">
            <button type="button" onClick={() => handleCommand("bold")} title="Bold"><b>B</b></button>
            <button type="button" onClick={() => handleCommand("italic")} title="Italic"><i>I</i></button>
            <button type="button" onClick={() => handleCommand("underline")} title="Underline"><u>U</u></button>
            <button type="button" onClick={handleCreateLink} title="Insert Link">🔗</button>
            <button type="button" onClick={handleInsertImage} title="Insert Image">🖼️</button>
            <select value={currentFont} onChange={handleFontFamily} className="font-family-select" title="Font Family">
              {FONT_FAMILIES.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
              ))}
            </select>
            <select value={currentFontSize} onChange={handleFontSize} className="font-size-select" title="Font Size">
              {FONT_SIZES.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <input type="color" value={currentColor} onChange={handleColor} title="Text Color" className="color-picker" />
          </div>
          <div
            className="content-editor"
            contentEditable
            data-placeholder="Write your blog here..."
            ref={editorRef}
            onInput={handleInput}
            spellCheck={true}
          ></div>
          <div className="word-count">{wordCount} word{wordCount !== 1 ? "s" : ""}</div>
          <button className="publish-btn" onClick={handlePublish}>Publish Blog</button>
          {publishMsg && <div className="publish-msg">{publishMsg}</div>}
        </div>
        <div className="right-panel">
          <div className="prompt-generator-box">
            <h2 className="blog-generator-heading">Blog Generator</h2>
            <div className="prompt-input-group">
              <input
                type="text"
                placeholder="Enter your prompt..."
                value={promptInput}
                onChange={e => setPromptInput(e.target.value)}
                onKeyDown={handlePromptKeyDown}
                className="prompt-input"
              />
              <button
                className="prompt-generate-btn"
                onClick={handleGeneratePrompt}
                title="Generate"
              >→</button>
            </div>
            {generatedPrompt && (
              <div className="result-group">
                <div className="prompt-result">{generatedPrompt}</div>
                <button className="copy-btn" onClick={handleCopy}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="blogs-list-panel-bottom">
        <h2 className="popular-blogs-title">
          <span role="img" aria-label="fire">🔥</span> My Blogs
        </h2>
        <div className="blogs-list">
          {blogs.map((blog, idx) => (
            <div className="blog-list-item" key={idx} onClick={() => setModalBlog(blog)}>
              <div className="blog-list-title">{blog.title}</div>
              <div className="blog-list-meta">by {blog.author} | {blog.date}</div>
              <div className="blog-list-desc">
                {blog.content.replace(/<[^>]+>/g, '').slice(0, 80)}...
                {blog.images?.length
                  ? <img src={blog.images[0]} alt="Blog" className="list-img" />
                  : null}
              </div>
            </div>
          ))}
        </div>
      </div>
      {showCropper && <CropperModal src={cropSrc} onCancel={handleCropCancel} onCrop={handleCropInsert} />}
      {modalBlog && <BlogModal blog={modalBlog} onClose={() => setModalBlog(null)} />}
    </div>
  );
}
