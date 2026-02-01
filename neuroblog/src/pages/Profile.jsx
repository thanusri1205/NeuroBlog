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
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
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

  useEffect(() => {
    const uid = Number(localStorage.getItem("userId"));
    if (!uid) return;
    setUserId(uid);

    let storedProfile = {
      name: localStorage.getItem("profileName") || "",
      bio: localStorage.getItem("profileBio") || "",
      pic: localStorage.getItem("profilePic") || "https://via.placeholder.com/120",
    };

    if (!storedProfile.name) {
      const email = localStorage.getItem("userEmail") || "";
      storedProfile.name = email.split("@")[0] || "User Name";
    }

    setProfile(storedProfile);

    const users = JSON.parse(localStorage.getItem("users")) || {};
    const userData = users[uid] || { followers: [], following: [] };
    setFollowers(userData.followers.length);
    setFollowing(userData.following.length);

    fetchPostCount(uid);

    const refresh = () => fetchPostCount(uid);
    window.addEventListener("postsUpdated", refresh);
    return () => window.removeEventListener("postsUpdated", refresh);
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

  const handleSave = (e) => {
    e.preventDefault();
    const updatedProfile = { ...profile, name: formData.name, bio: formData.bio };
    const file = fileRef.current?.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        updatedProfile.pic = e.target.result;
        finalizeSave(updatedProfile);
      };
      reader.readAsDataURL(file);
    } else {
      finalizeSave(updatedProfile);
    }
  };

  const finalizeSave = (updatedProfile) => {
    setProfile(updatedProfile);
    localStorage.setItem("profileName", updatedProfile.name);
    localStorage.setItem("profileBio", updatedProfile.bio);
    localStorage.setItem("profilePic", updatedProfile.pic);
    setIsEditing(false);
    setFormData({ name: "", bio: "", pic: null });
    setPreview(null);
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2000);
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

  {/* Hidden file input */}
  <input
    type="file"
    ref={fileRef}
    accept="image/*"
    onChange={handleFileChange}
    id="profilePicInput"
    style={{ display: "none" }}
  />

  {/* Overlay label */}
  <label htmlFor="profilePicInput" className="change-pic-overlay">
    Change Profile Picture
  </label>
</div>

          <div className="profile-info">
            <h2>{profile.name || "User Name"}</h2>
            <p className="user-id">
              User ID: <strong>{userId}</strong>
            </p>
            <p>{profile.bio || "No bio added"}</p>

            <div className="stats">
              <div className="stat">
                <span>{followers}</span> Followers
              </div>
              <div className="stat">
                <span>{following}</span> Following
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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />

              <label>Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              />

              <label>Profile Picture</label>
              <input type="file" ref={fileRef} accept="image/*" onChange={handleFileChange} />

              {preview && <img src={preview} alt="Preview" className="profile-preview" />}

              <div className="edit-actions">
                <button type="submit">Save</button>
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
              </div>

              {saveMsg && <span className="save-msg" style={{ opacity: 1 }}>Saved!</span>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
