import { useNavigate } from "react-router-dom";
import "./Signup.css"
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();

  const handleSignupClick = () => {
    navigate("/transcript");
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
        newErrors.password = "Password must include at least one uppercase letter";
      } else if (
        !(/[a-z]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one lowercase letter";
      } else if (
        !(/[0-9]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one number";
      } else if (
        !(/[^\w\s]/.test(formData.password))
      ) {
        newErrors.password = "Password must include at least one special character";
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      handleSignupClick();
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
      <t>Welcome to Plan-A-Gator!</t>
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
