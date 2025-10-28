import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, CardBody, Input, Container, Section } from "../components/UIComponents";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Full name is required';
    } else if (formData.username.trim().length < 2) {
      newErrors.username = 'Name must be at least 2 characters';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupClick = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        window.dispatchEvent(new CustomEvent('userLogin'));
        navigate("/transcript");
      } else {
        setErrors({ general: data.error || 'Signup failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <Container size="sm">
        <Section>
          <div className="signup-container">
            <Card className="signup-card">
              <CardBody>
                <div className="signup-header">
                  <h1 className="signup-title">Create Account</h1>
                  <p className="signup-subtitle">Join Plan-A-Gator and start planning your academic journey</p>
                </div>

                <form onSubmit={handleSignupClick} className="signup-form">
                  {errors.general && (
                    <div className="alert alert-error mb-6">
                      {errors.general}
                    </div>
                  )}

                  <Input
                    label="Full Name"
                    type="text"
                    name="username"
                    placeholder="Enter your full name"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    required
                  />

                  <Input
                    label="Email Address"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={errors.email}
                    required
                  />

                  <Input
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    help="Password must be at least 6 characters"
                    required
                  />

                  <Input
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    error={errors.confirmPassword}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>

                <div className="signup-footer">
                  <p className="text-center text-muted">
                    Already have an account?{' '}
                    <Link to="/signin" className="text-primary font-medium">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </CardBody>
            </Card>
          </div>
        </Section>
      </Container>
    </div>
  );
}
