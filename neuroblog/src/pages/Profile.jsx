import React, { useEffect, useState, useRef } from "react";
import "./Profile.css";

export default function Profile() {
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    pic: "https://via.placeholder.com/120",
  });

  const [formData, setFormData] = useState({ name: "", bio: "", pic: null });
  const [isEditing, setIsEditing] = useState(false);
  const [preview, setPreview] = useState(null);

  // ✅ NEW: Likes / Dislikes state
  const [stats, setStats] = useState({
    likes: 0,
    dislikes: 0,
  });

  const [postsCount, setPostsCount] = useState(0);
  const [saveMsg, setSaveMsg] = useState(false);

  const fileRef = useRef(null);

  const fetchPostCount = async (uid) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/posts/count/${uid}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPostsCount(data.count);
    } catch (err) {
      console.error("Post count error:", err);
    }
  };

  // ✅ NEW: Fetch Likes / Dislikes
  const fetchReactionSummary = async (username) => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/users/${username}/reaction-summary`
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Reaction summary error:", err);
    }
  };

  // 🔥 LOAD PROFILE FROM BACKEND
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/me", {
      headers: {
        Authorization: "Bearer " + token,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUserId(data.id);

        setProfile({
          name: data.username,
          bio: data.bio || "",
          pic: data.profile_picture || "https://via.placeholder.com/120",
        });

        fetchPostCount(data.id);
        fetchReactionSummary(data.username); // ✅ load likes/dislikes
      })
      .catch((err) => console.error("Profile load error:", err));
  }, []);

  const startEditing = () => {
    setFormData({ name: profile.name, bio: profile.bio, pic: null });
    setPreview(null);
    setIsEditing(true);
  };

  const handleFileChange = () => {
    const file = fileRef.current?.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // 🔥 SAVE PROFILE TO BACKEND
  const handleSave = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://127.0.0.1:8000/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          username: formData.name,
          bio: formData.bio,
          profile_picture: preview || profile.pic,
        }),
      });

      if (!response.ok) throw new Error("Update failed");

      const data = await response.json();

      setProfile({
        name: data.username,
        bio: data.bio || "",
        pic: data.profile_picture || profile.pic,
      });

      // reload reaction summary if username changed
      fetchReactionSummary(data.username);

      setIsEditing(false);
      setSaveMsg(true);
      setTimeout(() => setSaveMsg(false), 2000);
    } catch (err) {
      console.error("Profile update error:", err);
    }
  };

  return (
    <div className="profile-bg">
      <div className="profile-container">

        {/* HEADER */}
        <div className="profile-header">
          <div className="avatar-wrapper">
            <img
              src={preview || profile.pic}
              alt="Profile"
              className="profile-pic"
            />

            <input
              type="file"
              ref={fileRef}
              accept="image/*"
              onChange={handleFileChange}
              id="profilePicInput"
              style={{ display: "none" }}
            />

            <label htmlFor="profilePicInput" className="change-pic-overlay">
              Change Profile Picture
            </label>
          </div>

          <div className="profile-info">
            <h2>{profile.name || "User Name"}</h2>
            <p>{profile.bio || "No bio added"}</p>

            {/* ✅ UPDATED STATS SECTION */}
            <div className="stats">
              <div className="stat">
                <span>{stats.likes}</span> Likes
              </div>
              <div className="stat">
                <span>{stats.dislikes}</span> Dislikes
              </div>
              <div className="stat">
                <span>{postsCount}</span> Posts
              </div>
            </div>

            {!isEditing && (
              <button className="edit-profile-btn" onClick={startEditing}>
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* EDIT FORM */}
        {isEditing && (
          <div className="edit-section">
            <h3>Edit Profile</h3>
            <form onSubmit={handleSave}>
              <label>Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
              />

              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
              />

              <label>Profile Picture</label>
              <input
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={handleFileChange}
              />

              {preview && (
                <img
                  src={preview}
                  alt="Preview"
                  className="profile-preview"
                />
              )}

              <div className="edit-actions">
                <button type="submit">Save</button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
              </div>

              {saveMsg && (
                <span className="save-msg" style={{ opacity: 1 }}>
                  Saved!
                </span>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}