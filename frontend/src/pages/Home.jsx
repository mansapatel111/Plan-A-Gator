import React from "react"; 
import { Link, useNavigate } from "react-router-dom"; 
import { Button, Card, CardBody, Container, Section } from "../components/UIComponents"; 
import "./Home.css"; 

export default function Home() {
    return ( 
     <div className="home-root">
         {/* Hero Section */} 
         <section className="hero"> 
            <div className="hero-overlay" /> 
            <Container> 
                <div className="hero-content"> 
                    <h1 className="hero-title"> 
                        Build the schedule that actually works for you. 
                        </h1> 
                        <p className="hero-subtitle"> Plan-A-Gator helps UF students track degree progress, check prerequisites, and map out every semester with confidence. </p> 
                        <div className="hero-ctas"> 
                            <Link to="/signin" className="btn btn-primary btn-lg"> Sign In </Link> 
                            <Link to="/signup" className="btn btn-secondary btn-lg"> Create Account </Link> 
                        </div> 
                </div> 
            </Container> 
            </section> 
            {/* Features Section */} 
        <section className="features">
            <h2>What You Can Do</h2>
            <div className="feature-grid"> 
                <div className="feature-card"> 
                    <div className="feature-icon"> 
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> 
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/> 
                            <polyline points="14,2 14,8 20,8"/> 
                            <line x1="16" y1="13" x2="8" y2="13"/> 
                            <line x1="16" y1="17" x2="8" y2="17"/> 
                            <polyline points="10,9 9,9 8,9"/> 
                        </svg> 
                    </div> 
                    <h3>Transcript-based Planning</h3> 
                    <p> Import the classes you've already taken and we check requirements you've completed. No spreadsheets. No guessing. </p> 
                    </div> 
                <div className="feature-card"> 
                    <div className="feature-icon"> 
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"> 
                            <path d="M9 12l2 2 4-4"/> 
                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/> 
                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/> 
                            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/> 
                            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/> 
                            </svg>
                    </div> 
                    <h3>Prerequisite and conflict checks</h3>
                    <p> We warn you if you're missing a prerequisite, or if two classes overlap in time. Build a clean, valid schedule from the start. </p> 
                    </div> 
                    <div className="feature-card"> 
                        <div className="feature-icon"> 
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                     <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/> <line x1="16" y1="2" x2="16" y2="6"/> 
                                     <line x1="8" y1="2" x2="8" y2="6"/> <line x1="3" y1="10" x2="21" y2="10"/> 
                                </svg> 
                        </div> 
                        <h3>Weekly schedule builder</h3>
                        <p> Drag and drop courses into a live weekly view. See your semester laid out hour by hour and save it for advising or future needs. </p>
                        </div> 
            </div> 
        </section>
                                       
        {/* Footer */} 
        <footer className="home-footer"> 
            <div className="footer-content"> 
                <p> Built by students. Designed for Gators. </p> 
                <p className="footer-links"> 
                    <span onClick={() => navigate("/help")}>Help / FAQs</span> |{" "} 
                    <span onClick={() => navigate("/signin")}>Login</span> 
                </p>
            </div>
        </footer> 
    </div> 
    ); 
}