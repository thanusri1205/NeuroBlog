import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

if (!localStorage.getItem("userEmail")) {
  const email = "thanu123@gmail.com"; // 🔴 TEMP: replace with real email later
  localStorage.setItem("userEmail", email);

  const username = email.split("@")[0];
  localStorage.setItem("username", username);
}

// 🔐 TEMP USER (important)
if (!localStorage.getItem("userId")) {
  localStorage.setItem("userId", "1");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
