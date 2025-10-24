import { useNavigate } from "react-router-dom";
import "./Signup.css"
import "./Transcript";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupClick = async () => {
    const user = {
      username: document.querySelector('input[placeholder="Enter your full name"]').value,
      password: document.querySelector('input[placeholder="Create a password"]').value,
      email: document.querySelector('input[placeholder="Enter your email"]').value,
    };

    const res = await fetch("http://127.0.0.1:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user),
    });

    const data = await res.json();
    if (res.ok) {
      alert(data.message || 'Account created');
      localStorage.setItem("user_id", data.user_id);
      navigate("/transcript");
    } else {
      alert(data.error || 'Signup failed');
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Sign Up</h1>

        <label>Full Name:</label>
        <input type="text" placeholder="Enter your full name" />

        <label>Email:</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password:</label>
        <input type="password" placeholder="Create a password" />

        <button onClick={handleSignupClick}>Create Account</button>
      </div>
    </div>

  );
}
