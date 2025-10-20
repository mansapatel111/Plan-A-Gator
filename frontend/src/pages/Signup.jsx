import { useNavigate } from "react-router-dom";
import "./Signup.css"
import "./Transcript";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("./Transcript");
  }

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState({});

  const [showPassword, setShowPassword] = useState(false);

  //functions for validating sign up credentials
  const validEmail = (email) => {
    return /^[\w.+-]+@ufl\.edu$/i.test(email);
  }

  const validPassword = (password) => {
    return (
      password.length > 8 && 
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^\w\s]/.test(password)
    )
  }

  const handleFormChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value})
  }

  const handleFormSubmit = (e) => {
    e.preventDefault();
    let newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!validEmail(formData.email)) {
      newErrors.email = "Email must be a valid @ufl.edu address";
    }

    if (!validPassword(formData.password)) {
      if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !(/[A-Z]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one uppercase letter"
      } else if (
        !(/[a-z]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one lowercase letter"
      } else if (
        !(/[0-9]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one number"
      } else if (
        !(/[^\w\s]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one special character"
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSignupClick();
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h1>Sign Up</h1>
        <form onSubmit={handleFormSubmit}>
          <label>First Name:</label>
          <input type="text" name="firstName" placeholder="Enter your first name" value={formData.firstName} onChange={handleFormChange}/>
          {errors.firstName && <p className="error">{errors.firstName}</p>}

          <label>Last Name:</label>
          <input type="text" name="lastName" placeholder="Enter your last name" value={formData.lastName} onChange={handleFormChange}/>
          {errors.lastName && <p className="error">{errors.lastName}</p>}

          <label>Email:</label>
          <input type="email" name="email" placeholder="Enter your UFL email" value={formData.email} onChange={handleFormChange}/>
          {errors.email && <p className="error">{errors.email}</p>}

          <label>Password:</label>
          <input type={showPassword ? "text" : "password"} name="password" placeholder="Create a password" value={formData.password} onChange={handleFormChange}/>
          <div className="password-container">
            <button type="button" className="show-password-button" onClick={() => setShowPassword(!showPassword)}>{showPassword ? "Hide" : "Show"}</button>
          </div>
          {errors.password && <p className="error">{errors.password}</p>}

          <button type="submit">Create Account</button>
        </form>
      </div>
    </div>

  );
}
