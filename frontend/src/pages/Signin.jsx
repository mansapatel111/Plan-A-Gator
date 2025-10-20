import { useNavigate } from "react-router-dom";
import "./Signin.css"
import "./Scheduler";

export default function Signin() {
  const navigate = useNavigate();

  const handleSigninClick = () => {
    navigate("./Scheduler");
  }

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