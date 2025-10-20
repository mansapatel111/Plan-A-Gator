import { useState } from "react";
import "./Scheduler.css";

export default function Scheduler() {
  const [draggedCourse, setDraggedCourse] = useState(null);
  const [schedule, setSchedule] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Sample course data - Victoria needs to replace this with real data variables
  const courseCategories = {
    "Core Classes": [
      { code: "COP3502", name: "Programming Fundamentals 1", credits: 3, instructor: "Dr. Smith", time: "MWF 10:00-11:00" },
      { code: "COP3503", name: "Programming Fundamentals 2", credits: 3, instructor: "Dr. Johnson", time: "TR 2:00-3:15" },
      { code: "CDA3101", name: "Introduction to Computer Organization", credits: 3, instructor: "Dr. Williams", time: "MWF 1:00-2:00" },
      { code: "COP3530", name: "Data Structures and Algorithms", credits: 3, instructor: "Dr. Brown", time: "TR 11:00-12:15" },
    ],
    "Technical Electives": [
      { code: "COP4600", name: "Operating Systems", credits: 3, instructor: "Dr. Davis", time: "MWF 9:00-10:00" },
      { code: "CNT4007", name: "Computer Networks", credits: 3, instructor: "Dr. Miller", time: "TR 3:30-4:45" },
      { code: "CIS4301", name: "Information and Database Systems", credits: 3, instructor: "Dr. Garcia", time: "MWF 2:00-3:00" },
      { code: "CAP4770", name: "Introduction to Data Science", credits: 3, instructor: "Dr. Martinez", time: "TR 9:30-10:45" },
    ],
    "General Education": [
      { code: "MAC2311", name: "Calculus 1", credits: 4, instructor: "Dr. Anderson", time: "MWF 11:00-12:00" },
      { code: "MAC2312", name: "Calculus 2", credits: 4, instructor: "Dr. Taylor", time: "MWF 3:00-4:00" },
      { code: "PHY2048", name: "Physics with Calculus 1", credits: 3, instructor: "Dr. Thomas", time: "TR 1:00-2:15" },
      { code: "ENC1101", name: "Composition 1", credits: 3, instructor: "Prof. White", time: "MWF 8:00-9:00" },
    ],
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const times = ["8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", 
                 "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"];

  const handleDragStart = (course) => {
    setDraggedCourse(course);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (day, time) => {
    if (draggedCourse) {
      const key = `${day}-${time}`;
      setSchedule((prev) => ({
        ...prev,
        [key]: draggedCourse,
      }));
      setDraggedCourse(null);
    }
  };

  const handleRemoveCourse = (key, e) => {
    e.stopPropagation();
    setSchedule((prev) => {
      const newSchedule = { ...prev };
      delete newSchedule[key];
      return newSchedule;
    });
  };

  const handleClearSchedule = () => {
    setSchedule({});
  };

  const handleSaveSchedule = () => {
    console.log("Saving schedule:", schedule);
    alert("Schedule saved! (Check console for details)");
  };

  // Calculate total credits
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

  // Cunt unique courses
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
                    <div className="course-credits">{course.credits} credits</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Side - Weekly Schedule */}
        <div className="schedule-area">
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
              <>
                <div key={`time-${time}`} className="time-slot">
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
                            onClick={(e) => handleRemoveCourse(key, e)}
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
              </>
            ))}
          </div>

          {/* Total Credi Section */}
          <div className="total-credits">
            <div>
              <div className="total-credits-label">Total Credits</div>
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