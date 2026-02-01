import React, { useState } from "react";
import "./Settings.css";

export default function Settings() {
  const [security, setSecurity] = useState({
    username: "",
    email: "",
    additionalEmail: "",
    phone: "",
    password: "",
  });

  const [viewMode, setViewMode] = useState({
    theme: "dark",
    font: "arial",
    fontSize: "medium",
  });

  // Optionally implement save logic here (e.g. API/localStorage)
  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    alert("Security settings saved!");
  };

  const handleViewSubmit = (e) => {
    e.preventDefault();
    alert("View mode settings saved!");
  };

  const handleSecInput = (e) => {
    setSecurity({ ...security, [e.target.id]: e.target.value });
  };

  const handleViewInput = (e) => {
    setViewMode({ ...viewMode, [e.target.id]: e.target.value });
  };

  return (
    <div className="settings-bg">
      <div className="settings-container">
        {/* Security Settings */}
        <form className="section" onSubmit={handleSecuritySubmit}>
          <h2>🔐 Security Settings</h2>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter username"
            value={security.username}
            onChange={handleSecInput}
          />

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter email"
            value={security.email}
            onChange={handleSecInput}
          />

          <label htmlFor="additionalEmail">Additional Email</label>
          <input
            type="email"
            id="additionalEmail"
            placeholder="Enter backup email"
            value={security.additionalEmail}
            onChange={handleSecInput}
          />

          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            placeholder="Enter phone number"
            value={security.phone}
            onChange={handleSecInput}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter new password"
            value={security.password}
            onChange={handleSecInput}
          />

          <button type="submit">Save Security Settings</button>
        </form>
        {/* View Mode Settings */}
        <form className="section" onSubmit={handleViewSubmit}>
          <h2>🎨 View Mode Settings</h2>
          <label htmlFor="theme">Theme</label>
          <select id="theme" value={viewMode.theme} onChange={handleViewInput}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <label htmlFor="font">Font Style</label>
          <select id="font" value={viewMode.font} onChange={handleViewInput}>
            <option value="arial">Arial</option>
            <option value="verdana">Verdana</option>
            <option value="times">Times New Roman</option>
            <option value="courier">Courier New</option>
          </select>

          <label htmlFor="fontSize">Font Size</label>
          <select id="fontSize" value={viewMode.fontSize} onChange={handleViewInput}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
          <button type="submit">Save View Settings</button>
        </form>
      </div>
    </div>
  );
}
