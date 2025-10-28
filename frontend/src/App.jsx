import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Scheduler from "./pages/Scheduler";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Transcript from "./pages/Transcript";
import Help from "./pages/Help";
import Home from "./pages/Home";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <Router>
      <nav className = "navbar">
        <div className = "navbar-left">
            <Link to="/" className = "navbar-logo">Plan-A-Gator</Link>
        </div>

        <div className="navbar-right">
          <Link to= "/help" className="navbar-cta primary">Help/FAQs</Link>
          <Link to= "/signin" className="navbar-cta primary"
            onDoubleClick={() => {
              setIsLoggedIn(false);
            }}
          >Logout</Link>
        </div>
      </nav>

    <div className = "page-content">
      <Routes>
        {/* 👇 This is your default page */}
        <Route path="/" element={<Home />} />

        <Route path="/signin" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/transcript" element={<Transcript />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="/help" element={<Help />} />

        {/* Optional: Catch-all route (redirect any unknown path to signin) */}
        <Route path="*" element={<Signin />} />
      </Routes>
      </div>
    </Router>
  );
}
