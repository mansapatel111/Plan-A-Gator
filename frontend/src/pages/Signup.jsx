import { useNavigate } from "react-router-dom";
import "./Signup.css"
import "./Transcript";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("./Transcript");
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Sign Up</h1>

        <label>First Name:</label>
        <input type="text" placeholder="Enter your first name" />

        <label>Last Name:</label>
        <input type="text" placeholder="Enter your last name" />

        <label>Email:</label>
        <input type="email" placeholder="Enter your email" />

        <label>Password:</label>
        <input type="password" placeholder="Create a password" />

        <button onClick={handleSignupClick}>Create Account</button>
      </div>
    </div>

  );
}
