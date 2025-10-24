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
  const [courseInfo, setCourseInfo] = useState({});
  const [loadingCourseInfo, setLoadingCourseInfo] = useState(new Set());
  const [activeInfoCard, setActiveInfoCard] = useState(null);
  const scheduleRef = useRef(null);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["8:30 AM", "9:35 AM", "10:40 AM", "11:45 AM", "12:50 PM", 
                 "1:55 PM", "2:55 PM", "3:55 PM", "4:55 PM", "5:55 PM"];

  // Helper function to generate random times for courses
  const generateRandomTime = () => {
    const patterns = [
      { days: ["Monday", "Wednesday", "Friday"], duration: 0.50 }, // MWF 1 hour
      { days: ["Tuesday", "Thursday"], duration: 1.50 }, // TR 1.25 hours
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

  // Function to fetch course information
  const fetchCourseInfo = async (courseCode) => {
    if (courseInfo[courseCode] || loadingCourseInfo.has(courseCode)) {
      return;
    }

    setLoadingCourseInfo(prev => new Set(prev).add(courseCode));

    try {
      const response = await fetch(`http://127.0.0.1:5000/get-course-info/${courseCode}`);
      const data = await response.json();
      
      if (data.success) {
        setCourseInfo(prev => ({
          ...prev,
          [courseCode]: data.course_info
        }));
      }
    } catch (error) {
      console.error('Error fetching course info:', error);
    } finally {
      setLoadingCourseInfo(prev => {
        const newSet = new Set(prev);
        newSet.delete(courseCode);
        return newSet;
      });
    }
  };

  // Modified useEffect to include course info fetching
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
              // Fetch course info for each course
              fetchCourseInfo(code);
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
              fetchCourseInfo(code);
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
              fetchCourseInfo(code);
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
    const newSchedule = { ...schedule };
    const { days: courseDays, startTime } = course.timeInfo;
    
    // Find the time index
    const timeIndex = times.indexOf(startTime);
    
    if (timeIndex !== -1) {
      courseDays.forEach(day => {
        const key = `${day}-${startTime}`;
        newSchedule[key] = course;
      });
      
      setSchedule(newSchedule);
    }
  };

  const handleCourseClick = (course) => {
    addCourseToSchedule(course);
  };

  const handleInfoClick = (course, e) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveInfoCard(course.code);
    // Fetch course info if not already loaded
    fetchCourseInfo(course.code);
  };

  const handleCloseInfoCard = (e) => {
    e.stopPropagation();
    setActiveInfoCard(null);
  };

  const handleDrop = (day, time) => {
    if (draggedCourse) {
      const key = `${day}-${time}`;
      setSchedule(prev => ({
        ...prev,
        [key]: draggedCourse
      }));
      setDraggedCourse(null);
    }
  };

  const handleRemoveCourse = (courseCode, e) => {
    e.stopPropagation();
    const newSchedule = { ...schedule };
    Object.keys(newSchedule).forEach(key => {
      if (newSchedule[key].code === courseCode) {
        delete newSchedule[key];
      }
    });
    setSchedule(newSchedule);
  };

  const handleClearSchedule = () => {
    setSchedule({});
  };

  const handleSaveSchedule = async () => {
    try {
      const canvas = await html2canvas(scheduleRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF();
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save('schedule.pdf');
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  const calculateTotalCredits = () => {
    const uniqueCourses = new Set();
    Object.values(schedule).forEach(course => {
      uniqueCourses.add(course.code);
    });
    
    let totalCredits = 0;
    uniqueCourses.forEach(courseCode => {
      const course = Object.values(schedule).find(c => c.code === courseCode);
      if (course) {
        totalCredits += courseInfo[courseCode]?.credits || course.credits;
      }
    });
    
    return totalCredits;
  };

  const countUniqueCourses = () => {
    const uniqueCourses = new Set();
    Object.values(schedule).forEach(course => {
      uniqueCourses.add(course.code);
    });
    return uniqueCourses.size;
  };

  const filteredCategories = Object.entries(courseCategories).reduce(
    (acc, [category, courses]) => {
      const filteredCourses = courses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      acc[category] = filteredCourses;
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
                      {course.code}
                      <div 
                        className="info-icon"
                        onClick={(e) => handleInfoClick(course, e)}
                      >
                        i
                      </div>
                    </div>
                    <div className="course-name">
                      {courseInfo[course.code]?.name || course.name}
                    </div>
                    <div className="course-credits">
                      {courseInfo[course.code]?.credits || course.credits} credits
                    </div>
                    <div className="course-instructor">
                      {courseInfo[course.code]?.instructor || course.instructor}
                    </div>
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
                            <div className="course-name">
                              {courseInfo[course.code]?.name || course.name}
                            </div>
                            <div className="course-instructor">
                              {courseInfo[course.code]?.instructor || course.instructor}
                            </div>
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

      {/* Info Card Modal */}
      {activeInfoCard && (
        <div className="info-card-overlay" onClick={handleCloseInfoCard}>
          <div className="info-card-modal" onClick={(e) => e.stopPropagation()}>
            <div className="info-card-header">
              <h3>{activeInfoCard}</h3>
              <button className="info-card-close" onClick={handleCloseInfoCard}>
                ×
              </button>
            </div>
            <div className="info-card-content">
              {courseInfo[activeInfoCard] ? (
                <>
                  <div className="info-section">
                    <div className="info-label">Course Name</div>
                    <div className="info-value">{courseInfo[activeInfoCard].name}</div>
                  </div>
                  
                  <div className="info-section">
                    <div className="info-label">Credits</div>
                    <div className="info-value">{courseInfo[activeInfoCard].credits}</div>
                  </div>
                  
                  <div className="info-section">
                    <div className="info-label">Grading Scheme</div>
                    <div className="info-value">{courseInfo[activeInfoCard].grading_scheme || "Letter Grade"}</div>
                  </div>
                  
                  <div className="info-section">
                    <div className="info-label">Instructor</div>
                    <div className="info-value">{courseInfo[activeInfoCard].instructor || "TBD"}</div>
                  </div>
                  
                  <div className="info-section">
                    <div className="info-label">Description</div>
                    <div className="info-value description">
                      {courseInfo[activeInfoCard].description || "No description available."}
                    </div>
                  </div>
                  
                  {courseInfo[activeInfoCard].prerequisites && (
                    <div className="info-section">
                      <div className="info-label">Prerequisites</div>
                      <div className="info-value">
                        {courseInfo[activeInfoCard].prerequisites}
                      </div>
                    </div>
                  )}
                  
                  {courseInfo[activeInfoCard].syllabus_url && (
                    <div className="info-section">
                      <div className="info-label">Syllabus</div>
                      <div className="info-value">
                        <a 
                          href={courseInfo[activeInfoCard].syllabus_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="syllabus-link-large"
                        >
                          View Course Syllabus →
                        </a>
                      </div>
                    </div>
                  )}
                </>
              ) : loadingCourseInfo.has(activeInfoCard) ? (
                <div className="loading-info">
                  <div className="loading-spinner"></div>
                  <div>Loading course information...</div>
                </div>
              ) : (
                <div className="info-section">
                  <div className="info-value">Course information not available.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}