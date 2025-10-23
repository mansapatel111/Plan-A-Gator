import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import "./Signin.css"


export default function Signin() {
  const navigate = useNavigate();

  const handleSigninClick = () => {
    navigate("/scheduler");
  }

  const [formData, setFormData] = useState({
      email: "",
      password: "",
    })

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  const handleFormChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleFormSubmit = (e) => {
      e.preventDefault();
      let newErrors = {};

      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      }

      if (!formData.password.trim()) {
        newErrors.password = "Password is required";
      }

      setErrors(newErrors);

      if (Object.keys(newErrors).length === 0) {
        handleSigninClick();
      }
  }

  return (
    <div className="signin-page">
      <t>Welcome to Plan-A-Gator!</t>
      <div className="signin-card">
        <h1>Sign In</h1>
        <form onSubmit={handleFormSubmit}>
          <div className="input-group">
            <label>Email:</label>
            <input type="email" name="email" placeholder="Enter your email" value={formData.email} onChange={handleFormChange}/>
            {errors.email && <div className="error">{errors.email}</div>}
          </div>
          
          <div className="input-group">
            <label>Password:</label>
            <div className="password-container">
              <input type={showPassword ? "text" : "password"} name = "password" placeholder="Enter your password" value={formData.password} onChange={handleFormChange}/>
              <button type="button" className="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
            {errors.password && <div className="error">{errors.password}</div>}
          </div>
          
          <div className="signup-link">
            <label>Don't have an account?</label> <Link to="/signup">Click here to sign up!</Link>
          </div>

          <button type="submit">Sign in</button>
        </form>
      </div>
    </div>
  );
}