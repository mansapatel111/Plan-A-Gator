import { useState, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from "react";
import "./Scheduler.css";

export default function Scheduler() {
  const [draggedCourse, setDraggedCourse] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [courseCategories, setCourseCategories] = useState({
    "Core Classes": [],
    "Technical Electives": [],
    "General Education": []
  });
  const scheduleRef = useRef(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
                 "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  // Helper function to generate random times for courses
  const generateRandomTime = () => {
    const patterns = [
      { days: ["Monday", "Wednesday", "Friday"], duration: 1 }, // MWF 1 hour
      { days: ["Tuesday", "Thursday"], duration: 1.25 }, // TR 1.25 hours
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const startTimeIndex = Math.floor(Math.random() * (times.length - 2));
    const startTime = times[startTimeIndex];
    
    return {
      days: pattern.days,
      startTime: startTime,
      duration: pattern.duration
    };
  };

  // Modified useEffect to include random times
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const user_id = localStorage.getItem('user_id');
        const classes = localStorage.getItem('parsed_classes') || '';
        console.log('Fetching recommendations for user:', user_id);
        
        const response = await fetch(`http://127.0.0.1:5000/get-course-recommendations?user_id=${user_id}&classes=${classes}`);
        const data = await response.json();
        console.log('Received data:', data);
        
        if (response.ok) {
          if (!data.recommendations) {
            console.error('No recommendations in response');
            return;
          }

          const formattedCourses = {
            "Core Classes": (data.recommendations.Core || []).map(code => {
              const timeInfo = generateRandomTime();
              return {
                code,
                name: `Course ${code}`,
                credits: 3,
                instructor: "TBD",
                timeInfo: timeInfo,
                time: `${timeInfo.days.map(d => d.slice(0, 2)).join('')} ${timeInfo.startTime}`
              };
            }),
            "Technical Electives": (data.recommendations["Elective/eligible"] || []).map(code => {
              const timeInfo = generateRandomTime();
              return {
                code,
                name: `Course ${code}`,
                credits: 3,
                instructor: "TBD",
                timeInfo: timeInfo,
                time: `${timeInfo.days.map(d => d.slice(0, 2)).join('')} ${timeInfo.startTime}`
              };
            }),
            "General Education": (data.recommendations.GenEd || []).map(code => {
              const timeInfo = generateRandomTime();
              return {
                code,
                name: `Course ${code}`,
                credits: 3,
                instructor: "TBD",
                timeInfo: timeInfo,
                time: `${timeInfo.days.map(d => d.slice(0, 2)).join('')} ${timeInfo.startTime}`
              };
            })
          };
          console.log('Formatted courses:', formattedCourses);
          setCourseCategories(formattedCourses);
        } else {
          console.error('Failed to fetch recommendations:', data.error);
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
      }
    };
    
    fetchRecommendations();
  }, []);

  const handleDragStart = (course) => {
    setDraggedCourse(course);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };


const addCourseToSchedule = (course) => {
  if (!course || !course.timeInfo) return;

  const { days: courseDays, startTime } = course.timeInfo;


  let hasConflict = false;
  let conflictingCourse = null;
  
  for (const courseDay of courseDays) {
    const key = `${courseDay}-${startTime}`;
    if (schedule[key]) {
      hasConflict = true;
      conflictingCourse = schedule[key];
      break;
    }
  }

  if (hasConflict) {
    alert(`Time conflict! This course meets on ${courseDays.join('/')} at ${startTime}, but ${conflictingCourse.code} is already scheduled at that time.`);
    return false;
  }

 
  setSchedule((prev) => {
    const newSchedule = { ...prev };
    courseDays.forEach(courseDay => {
      const key = `${courseDay}-${startTime}`;
      newSchedule[key] = course;
    });
    return newSchedule;
  });

  return true;
};

    const handleCourseClick = (course) => {
    addCourseToSchedule(course);
    };

  const handleDrop = (day, time) => {
  if (!draggedCourse) return;
  
  addCourseToSchedule(draggedCourse);
  setDraggedCourse(null);
};

  const handleRemoveCourse = (courseCode, e) => {
    e.stopPropagation();
    
    // Remove all instances of this course from the schedule
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      Object.keys(newSchedule).forEach(key => {
        if (newSchedule[key].code === courseCode) {
          delete newSchedule[key];
        }
      });
      return newSchedule;
    });
  };

  const handleClearSchedule = () => {
    setSchedule({});
  };

    const handleSaveSchedule = async () => {
        try {
        // Make sure we have a reference to the schedule element
        if (!scheduleRef.current) {
        throw new Error('Schedule element not found');
        }

        // Add a temporary class for better PDF capture
        scheduleRef.current.classList.add('printing');

        // Create canvas with better settings
        const canvas = await html2canvas(scheduleRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging to debug issues
        onclone: (document) => {
            // Any cleanup needed before capture
            const element = document.querySelector('.schedule-grid');
            if (element) {
            element.style.backgroundColor = '#ffffff';
            }
        }
        });

        // Create PDF with proper dimensions
        const pdfWidth = 210; // A4 width in mm
        const pdfHeight = 297; // A4 height in mm
        const aspectRatio = canvas.height / canvas.width;
        const imgWidth = pdfWidth - 20; // Leave 10mm margin on each side
        const imgHeight = imgWidth * aspectRatio;

        // Initialize PDF
        const pdf = new jsPDF({
        orientation: imgHeight > pdfWidth ? 'portrait' : 'landscape',
        unit: 'mm',
        format: 'a4'
        });

        // Add title
        pdf.setFontSize(16);
        pdf.text('Weekly Schedule', pdfWidth / 2, 15, { align: 'center' });

        // Add the schedule image
        try {
        pdf.addImage(
            canvas.toDataURL('image/jpeg', 1.0),
            'JPEG',
            10, // Left margin
            25, // Top margin after title
            imgWidth,
            imgHeight
        );

        // Add schedule details at bottom
        pdf.setFontSize(12);
        const bottomY = Math.min(imgHeight + 35, pdfHeight - 15);
        pdf.text(`Total Courses: ${countUniqueCourses()}`, 10, bottomY);
        pdf.text(`Total Credits: ${calculateTotalCredits()}`, 10, bottomY + 7);

        // Save the PDF
        pdf.save(`schedule-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (imageError) {
        console.error('Error adding image to PDF:', imageError);
        throw new Error('Failed to generate PDF: Image processing error');
        }

        // Remove temporary printing class
        scheduleRef.current.classList.remove('printing');
        
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert(`Failed to generate PDF: ${error.message}`);
    }
    };

  const calculateTotalCredits = () => {
    const uniqueCourses = new Set();
    Object.values(schedule).forEach((course) => {
      uniqueCourses.add(course.code);
    });
    return Array.from(uniqueCourses).reduce((total, code) => {
      const course = Object.values(courseCategories)
        .flat()
        .find((c) => c.code === code);
      return total + (course?.credits || 0);
    }, 0);
  };

  const countUniqueCourses = () => {
    const uniqueCourses = new Set();
    Object.values(schedule).forEach((course) => {
      uniqueCourses.add(course.code);
    });
    return uniqueCourses.size;
  };

  const filteredCategories = Object.entries(courseCategories).reduce(
    (acc, [category, courses]) => {
      const filtered = courses.filter(
        (course) =>
          course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {}
  );

  return (
    <div className="scheduler-page">
      <div className="scheduler-container">
        {/* Left Sidebar - Available Courses */}
        <div className="courses-sidebar">
          <h2>Available Courses</h2>
          
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {Object.entries(filteredCategories).map(([category, courses]) => (
            <div key={category} className="course-category">
              <div className="category-title">{category}</div>
              <div className="course-list">
                {courses.map((course) => (
                  <div
                    key={course.code}
                    className="course-card"
                    draggable
                    onDragStart={() => handleDragStart(course)}
                    onClick={() => handleCourseClick(course)}
                  >
                    <div className="course-code">
                      <span>{course.code}</span>
                      <div 
                        className="info-icon"
                        onMouseEnter={(e) => e.stopPropagation()}
                        onClick={(e) => e.stopPropagation()}
                      >
                        i
                        <div className="info-tooltip">
                          <div className="tooltip-title">{course.code}</div>
                          <div className="tooltip-content">
                            <div className="tooltip-row">
                              <span className="tooltip-label">Name: </span>
                              {course.name}
                            </div>
                            <div className="tooltip-row">
                              <span className="tooltip-label">Credits: </span>
                              {course.credits}
                            </div>
                            <div className="tooltip-row">
                              <span className="tooltip-label">Instructor: </span>
                              {course.instructor}
                            </div>
                            <div className="tooltip-row">
                              <span className="tooltip-label">Time: </span>
                              {course.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="course-name">{course.name}</div>
                    <div className="course-credits">{course.credits} credits • {course.time}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Weekly Schedule */}
        <div className="schedule-area" ref={scheduleRef}>
          <div className="schedule-header">
            <h2>Weekly Schedule</h2>
            <div className="schedule-actions">
              <button className="btn-clear" onClick={handleClearSchedule}>
                Clear Schedule
              </button>
              <button className="btn-save" onClick={handleSaveSchedule}>
                Save Schedule
              </button>
            </div>
          </div>

          <div className="schedule-grid">
            {/* Top-left corner */}
            <div className="time-header">Time</div>

            {/* Day headers */}
            {days.map((day) => (
              <div key={day} className="day-header">
                {day}
              </div>
            ))}

            {/* Time slots and schedule cells */}
            {times.map((time) => (
              <React.Fragment key={time}>
                <div className="time-slot">
                  {time}
                </div>
                {days.map((day) => {
                  const key = `${day}-${time}`;
                  const course = schedule[key];
                  
                  return (
                    <div
                      key={key}
                      className="schedule-cell"
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(day, time)}
                    >
                      {course && (
                        <div className="scheduled-course">
                          <button
                            className="remove-course"
                            onClick={(e) => handleRemoveCourse(course.code, e)}
                          >
                            ×
                          </button>
                          <div>
                            <div className="course-code">{course.code}</div>
                            <div className="course-name">{course.name}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Total Credits Section */}
          <div className="total-credits">
            <div>
              <div className="total-credits-label">Schedule Summary</div>
              <div className="credits-breakdown">
                <div className="breakdown-item">
                  <span className="breakdown-value">{countUniqueCourses()}</span>
                  <span className="breakdown-label">Courses</span>
                </div>
                <div className="breakdown-item">
                  <span className="breakdown-value">{calculateTotalCredits()}</span>
                  <span className="breakdown-label">Credits</span>
                </div>
              </div>
            </div>
            <div className="total-credits-value">{calculateTotalCredits()} Credits</div>
          </div>
        </div>
      </div>
    </div>
  );
}