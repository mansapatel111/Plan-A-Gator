import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Card, CardBody, Input, Container, Section } from "../components/UIComponents";
import "./Signin.css";

export default function Signin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSigninClick = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      const res = await fetch("http://127.0.0.1:5000/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("user_id", data.user_id);
        window.dispatchEvent(new CustomEvent('userLogin'));
        navigate("/scheduler");
      } else {
        setErrors({ general: data.error || 'Sign in failed' });
      }
    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <Container size="sm">
        <Section>
          <div className="signin-container">
            <Card className="signin-card">
              <CardBody>
                <div className="signin-header">
                  <h1 className="signin-title">Welcome Back</h1>
                  <p className="signin-subtitle">Sign in to your Plan-A-Gator account</p>
                </div>

                <form onSubmit={handleSigninClick} className="signin-form">
                  {errors.general && (
                    <div className="alert alert-error mb-6">
                      {errors.general}
                    </div>
                  )}

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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    error={errors.password}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>

                <div className="signin-footer">
                  <p className="text-center text-muted">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-primary font-medium">
                      Create one here
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