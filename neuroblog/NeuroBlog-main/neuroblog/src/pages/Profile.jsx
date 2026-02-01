import React, { useState, useEffect, useRef } from "react";
import "./Profile.css";

export default function Profile() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [pic, setPic] = useState("https://via.placeholder.com/120");
  const [saveMsg, setSaveMsg] = useState(false);
  const fileRef = useRef(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedName = localStorage.getItem("profileName");
    const savedBio = localStorage.getItem("profileBio");
    const savedPic = localStorage.getItem("profilePic");
    if (savedName) setName(savedName);
    if (savedBio) setBio(savedBio);
    if (savedPic) setPic(savedPic);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name.trim()) {
      localStorage.setItem("profileName", name);
    }
    if (bio.trim()) {
      localStorage.setItem("profileBio", bio);
    }

    const fileInput = fileRef.current;
    const file = fileInput.files && fileInput.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = function (evt) {
        setPic(evt.target.result);
        localStorage.setItem("profilePic", evt.target.result);
        showSavedMessage();
      };
      reader.readAsDataURL(file);
    } else {
      showSavedMessage();
    }
    fileInput.value = "";
  };

  const showSavedMessage = () => {
    setSaveMsg(true);
    setTimeout(() => setSaveMsg(false), 2000);
  };

  return (
    <div className="profile-bg">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <img
            src={pic}
            alt="Profile"
            className="profile-pic"
            id="profileDisplay"
          />
          <div className="profile-info">
            <h2 id="displayName">{name || "----"}</h2>
            <p id="displayBio">{bio || "None"}</p>
            <div className="stats">
              <div className="stat">
                <span id="followersCount">0</span> Followers
              </div>
              <div className="stat">
                <span id="followingCount">0</span> Following
              </div>
              <div className="stat">
                <span id="postsCount">0</span> Posts
              </div>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="edit-section">
          <h3>Edit Profile</h3>
          <form id="editForm" onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              rows={3}
              placeholder="Write something about yourself"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />

            <label htmlFor="profilePic">Profile Picture</label>
            <input
              type="file"
              id="profilePic"
              accept="image/*"
              ref={fileRef}
            />

            <div>
              <button type="submit">Save Changes</button>
              <span
                className="save-msg"
                id="saveMsg"
                style={{ opacity: saveMsg ? 1 : 0 }}
              >
                Saved!
              </span>
            </div>
          </form>
        </div>

        {/* Blogs Created */}
        <div className="blogs-section">
          <h3>My Blogs</h3>
          <p>None</p>
        </div>
      </div>
    </div>
  );
}
