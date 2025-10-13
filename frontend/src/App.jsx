import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Scheduler from "./pages/Scheduler";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Transcript from "./pages/Transcript";

export default function App() {
  return (
    <Router>
      <nav className="p-4 bg-gray-200 flex gap-4">
        <Link to="/">Signin</Link>
        <Link to="/signup">Signup</Link>
        <Link to="/transcript">Transcript</Link>
        <Link to="/scheduler">Scheduler</Link>
      </nav>

      <Routes>
        {/* 👇 This is your default page */}
        <Route path="/" element={<Signin />} />

        <Route path="/signup" element={<Signup />} />
        <Route path="/transcript" element={<Transcript />} />
        <Route path="/scheduler" element={<Scheduler />} />

        {/* Optional: Catch-all route (redirect any unknown path to signin) */}
        <Route path="*" element={<Signin />} />
      </Routes>
    </Router>
  );
}