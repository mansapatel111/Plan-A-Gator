import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Button, Card, CardBody, Input, Select, Container, Section, Alert, LoadingSpinner } from "../components/UIComponents";
import "./Transcript.css";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export default function Transcript() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    grade: "",
    college: ""
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
      } else {
        setFile(null);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.grade) {
      newErrors.grade = "Please select your grade level.";
    }
    if (!formData.college) {
      newErrors.college = "Please select your college.";
    }
    if (!file) {
      newErrors.file = "Please upload your transcript (PDF).";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleParse = async () => {
    if (!validateForm()) return null;

    setIsLoading(true);
    
    try {
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
    } catch (error) {
      setErrors({ general: "Error parsing PDF. Please try again." });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseAndSave = async () => {
    const parsed = await handleParse();
    if (parsed === null) return;
    
    if (parsed.length === 0) {
      setErrors({ general: 'No courses found in transcript' });
      return;
    }
    
    const user_id = localStorage.getItem("user_id");
    if (!user_id) {
      setErrors({ general: 'No user_id found — please sign in or sign up first' });
      return;
    }

    // Normalize parsed codes client-side
    const normalized = parsed.map((s) => (s || '').toString().replace(/\s+/g, '').toUpperCase()).filter(Boolean);
    
    try {
      const res = await fetch("http://127.0.0.1:5000/update-user-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, grade: formData.grade, college: formData.college }),
      });
      
      if (!res.ok) {
        setErrors({ general: 'Failed to save user information' });
      }

      const saveResponse = await fetch('http://127.0.0.1:5000/save-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: parseInt(user_id),
          classes: parsed  
        })
      });

      const saveData = await saveResponse.json();
      
      if (!saveResponse.ok) {
        console.error('ERROR - Failed to save transcript:', saveData);
        setErrors({ general: `Failed to save courses: ${saveData.error}` });
        // Still navigate but show error
        localStorage.setItem('parsed_classes', parsed.join(','));
        navigate('/scheduler');
      } else {
        alert(`✓ Successfully saved ${saveData.saved_count} courses to your profile!`);
        localStorage.setItem('parsed_classes', parsed.join(','));
        navigate('/scheduler');
      }

    } catch (error) {
      setErrors({ general: 'Network error. Please try again.' });
      localStorage.setItem('parsed_classes', parsed.join(','));
      alert('Network error. Courses saved locally only.');
    }
  };

  const gradeOptions = [
    { value: "", label: "Select grade" },
    { value: "Freshman", label: "Freshman" },
    { value: "Sophomore", label: "Sophomore" },
    { value: "Junior", label: "Junior" },
    { value: "Senior", label: "Senior" }
  ];

  const collegeOptions = [
    { value: "", label: "Select college" },
    { value: "CLAS", label: "College of Liberal Arts & Sciences" },
    { value: "ENG", label: "College of Engineering" }
  ];

  return (
    <div className="transcript-page">
      <Container size="md">
        <Section>
          <div className="transcript-container">
            <Card className="transcript-card">
              <CardBody>
                <div className="transcript-header">
                  <h1 className="transcript-title">Upload Transcript</h1>
                  <p className="transcript-subtitle">
                    Upload your Florida Shines unofficial transcript to get personalized course recommendations
                  </p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); handleParseAndSave(); }} className="transcript-form">
                  {errors.general && (
                    <Alert variant="error" className="mb-6">
                      {errors.general}
                    </Alert>
                  )}

                  <Select
                    label="Grade Level"
                    name="grade"
                    value={formData.grade}
                    onChange={handleInputChange}
                    options={gradeOptions}
                    error={errors.grade}
                    required
                  />

                  <Select
                    label="College"
                    name="college"
                    value={formData.college}
                    onChange={handleInputChange}
                    options={collegeOptions}
                    error={errors.college}
                    required
                  />

                  <div className="form-group">
                    <label className="form-label">Transcript PDF</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="form-input"
                      required
                    />
                    {errors.file && <div className="form-error">{errors.file}</div>}
                    <div className="form-help">
                      Upload your Florida Shines printable unofficial transcript
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" />
                        Parsing Transcript...
                      </>
                    ) : (
                      'Parse Transcript'
                    )}
                  </Button>
                </form>

                {classes.length > 0 && (
                  <div className="extracted-courses">
                    <h2 className="courses-title">Extracted Courses</h2>
                    <div className="courses-grid">
                      {classes.map((cls, i) => (
                        <div key={i} className="course-badge">
                          {cls}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="transcript-footer">
                  <p className="help-text">
                    Need help downloading your transcript?{" "}
                    <a
                      href="https://www.floridashines.org/check-your-progress" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary"
                    >
                      Click here!
                    </a>
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
