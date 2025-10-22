import { useNavigate } from "react-router-dom";
import "./Signin.css"

export default function Signin() {
  const navigate = useNavigate();

  const handleSigninClick = async () => {
    const email = document.querySelector('input[placeholder="Enter your email"]').value;
    const password = document.querySelector('input[placeholder="Enter your password"]').value;

    const res = await fetch("http://127.0.0.1:5000/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("user_id", data.user_id);  // save logged-in user
      navigate("/scheduler");
    } else {
      alert(data.error);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1>Sign In</h1>

        <label>Email:</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password:</label>
        <input type="password" placeholder="Enter your password" />

        <button onClick={handleSigninClick}>Sign in</button>
      </div>
    </div>
  );
}