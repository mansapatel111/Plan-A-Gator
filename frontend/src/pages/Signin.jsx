import { useNavigate } from "react-router-dom";
import "./Signin.css"
import "./Transcript";

export default function Signin() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("./Transcript");
  }

  return (
    <div className="signin-page">
      <div className="signin-card">
        <h1>Sign In</h1>

        <label>Email:</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password:</label>
        <input type="password" placeholder="Enter your password" />

        <button onClick={handleSignupClick}>Sign in</button>
      </div>
    </div>
  );
}