import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import "./Transcript.css"; // Import the CSS file

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Transcript() {
  const [file, setFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [grade, setGrade] = useState("");
  const [college, setCollege] = useState("");

  // PDF upload handler
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Parse PDF and extract course codes
  const handleParse = async () => {
    if (!file) return alert("Please upload a PDF first!");

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
    setClasses([...new Set(matches)]);
  };

  return (
    <div className="transcript-page">
      <div className="transcript-card">
        <h1>Upload Transcript</h1>

        {/* Grade Dropdown */}
        <label>Grade Level:</label>
        <select value={grade} onChange={(e) => setGrade(e.target.value)}>
          <option value="">Select grade</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
          <option value="Junior">Junior</option>
          <option value="Senior">Senior</option>
          <option value="Graduate">Graduate</option>
        </select>

        {/* College Dropdown */}
        <label>College:</label>
        <select value={college} onChange={(e) => setCollege(e.target.value)}>
          <option value="">Select college</option>
          <option value="CLAS">College of Liberal Arts & Sciences</option>
          <option value="ENG">College of Engineering</option>
        </select>

        {/* PDF Upload */}
        <input type="file" accept="application/pdf" onChange={handleFileChange} />

        {/* Parse Button */}
        <button onClick={handleParse}>Parse Transcript</button>

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
      </div>
    </div>
  );
}
