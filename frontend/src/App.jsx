import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import Scheduler from "./pages/Scheduler";
import Signin from "./pages/Signin";
import Signup from "./pages/Signup";
import Transcript from "./pages/Transcript";

function Navbar() {
  const { pathname } = useLocation();
  const hideNav = pathname.toLowerCase().includes("/scheduler");

  if (hideNav) return null;
  return (
    <nav className="p-4 bg-gray-200 flex gap-4">
      <Link to="/">Signin</Link>
      <Link to="/signup">Signup</Link>
      <Link to="/transcript">Transcript</Link>
      <Link to="/scheduler">Scheduler</Link>
    </nav>
  );
}

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Signin />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/transcript" element={<Transcript />} />
        <Route path="/scheduler" element={<Scheduler />} />
        <Route path="*" element={<Signin />} />
      </Routes>
    </Router>
  );
}
