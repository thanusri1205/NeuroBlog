import React, { useState, useEffect } from "react";
import "./Settings.css";

export default function Settings() {
  const [viewMode, setViewMode] = useState({
    theme: "dark",
    font: "arial",
    fontSize: "medium",
  });

  /* ================= LOAD SAVED SETTINGS ================= */
  useEffect(() => {
    const saved = localStorage.getItem("viewSettings");
    if (saved) {
      const parsed = JSON.parse(saved);
      setViewMode(parsed);
      applySettings(parsed);
    }
  }, []);

  /* ================= APPLY SETTINGS ================= */
  const applySettings = (settings) => {
    const body = document.body;

    // Remove old classes
    body.classList.remove("light-theme", "dark-theme");
    body.classList.remove("font-arial", "font-verdana", "font-times", "font-courier");
    body.classList.remove("font-small", "font-medium", "font-large");

    // Add new theme
    body.classList.add(`${settings.theme}-theme`);

    // Add font
    body.classList.add(`font-${settings.font}`);

    // Add font size
    body.classList.add(`font-${settings.fontSize}`);
  };

  const handleChange = (e) => {
    setViewMode({ ...viewMode, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("viewSettings", JSON.stringify(viewMode));
    applySettings(viewMode);
    alert("View settings applied successfully!");
  };

  return (
    <div className="settings-bg">
      <div className="settings-container">
        <form className="section" onSubmit={handleSubmit}>
          <h2>🎨 View Mode Settings</h2>

          <label htmlFor="theme">Theme</label>
          <select id="theme" value={viewMode.theme} onChange={handleChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>

          <label htmlFor="font">Font Style</label>
          <select id="font" value={viewMode.font} onChange={handleChange}>
            <option value="arial">Arial</option>
            <option value="verdana">Verdana</option>
            <option value="times">Times New Roman</option>
            <option value="courier">Courier New</option>
          </select>

          <label htmlFor="fontSize">Font Size</label>
          <select id="fontSize" value={viewMode.fontSize} onChange={handleChange}>
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