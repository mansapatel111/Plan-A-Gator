import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./Transcript.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Transcript() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [grade, setGrade] = useState("");
  const [college, setCollege] = useState("");

  const [errors, setErrors] = useState({
    grade: "",
    college: "",
    file: "",
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  const handleParse = async () => {
    let newErrors = { grade: "", college: "", file: "" };
    let hasError = false;

    if (!grade) {
      newErrors.grade = "Please select your grade level.";
      hasError = true;
    }
    if (!college) {
      newErrors.college = "Please select your college.";
      hasError = true;
    }
    if (!file) {
      newErrors.file = "Please upload your transcript (PDF).";
      hasError = true;
    }

    setErrors(newErrors);
  if (hasError) return null;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map((item) => item.str).join(" ");
      fullText += text + "\n";
    }

    const courseRegex = /\b[A-Z]{3}\s?\d{4}[A-Z]?\b/g;
    const matches = fullText.match(courseRegex) || [];
    const unique = [...new Set(matches)];
    setClasses(unique);
    return unique;
  };

  const handleParseAndSave = async () => {
    console.log('Starting parse+save');
    const parsed = await handleParse();
    console.log('Parsed result:', parsed);
    if (parsed === null) return; // validation failed
    if (Array.isArray(parsed) && parsed.length === 0) {
      alert('No courses found in transcript');
      return;
    }
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      alert('No user_id found — please sign in or sign up first');
      return;
    }

    // normalize parsed codes client-side too (trim spaces + uppercase)
    const normalized = parsed.map((s) => (s || '').toString().replace(/\s+/g, '').toUpperCase()).filter(Boolean);
    console.log('Sending normalized classes:', normalized);
    const res = await fetch("http://127.0.0.1:5000/update-user-info", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id, grade, college }),
    });
    try {
      const res2 = await fetch("http://127.0.0.1:5000/save-transcript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, classes: normalized }),
      });

      const data = await res.json();
      const data2 = await res2.json();
      console.log('update-user-info response', res.ok, data);
      console.log('save-transcript response', res2.ok, data2);

      if (res.ok && res2.ok) {
        alert(data.message || data2.message || 'User info and transcript saved');
        // navigate to scheduler so the user can build schedules
        navigate('/scheduler');
      } else if (res.ok && !res2.ok) {
        alert(data2.error || data2.details || 'Transcript save failed');
      } else if (!res.ok && res2.ok) {
        alert(data.error || data.details || 'User info save failed');
      } else {
        alert((data.error || data.message) + ' & ' + (data2.error || data2.message) || 'Both saves failed');
      }
    } catch (err) {
      console.error('Network or server error', err);
      alert('Network or server error: ' + err.message);
    }
  };

  return (
    <div className="transcript-page">
      <div className="transcript-card">
        <h1>Upload Transcript</h1>

        {/* Grade Dropdown */}
        <label>Grade Level:</label>
        <select
          value={grade}
          onChange={(e) => {
            setGrade(e.target.value);
            setErrors((prev) => ({ ...prev, grade: "" }));
          }}
        >
          <option value="">Select grade</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
        </select>
        {errors.grade && <p className="error-text">{errors.grade}</p>}

        {/* College Dropdown */}
        <label>College:</label>
        <select
          value={college}
          onChange={(e) => {
            setCollege(e.target.value);
            setErrors((prev) => ({ ...prev, college: "" }));
          }}
        >
          <option value="">Select college</option>
          <option value="CLAS">College of Liberal Arts & Sciences</option>
          <option value="ENG">College of Engineering</option>
        </select>
        {errors.college && <p className="error-text">{errors.college}</p>}

        {/* PDF Upload */}
        <label>Transcript PDF:</label>
        <input type="file" accept="application/pdf" onChange={handleFileChange} />
        {errors.file && <p className="error-text">{errors.file}</p>}

        {/* Parse Button */}
        <button onClick={handleParseAndSave}>Parse Transcript</button>

        {/* Extracted Courses */}
        {classes.length > 0 && (
          <>
            <h2>Extracted Courses</h2>
            <ul>
              {classes.map((cls, i) => (
                <li key={i}>{cls}</li>
              ))}
            </ul>
          </>
        )}

        {/* Help Link */}
        <p className="help-text">
          Need help getting your transcript PDF?{" "}
          <a
            href="https://www.floridashines.org/check-your-progress" 
            target="_blank"
            rel="noopener noreferrer"
          >
            Click here
          </a>
        </p>
      </div>
    </div>
  );
}
