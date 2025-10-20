DROP TABLE IF EXISTS schedule_courses CASCADE;
DROP TABLE IF EXISTS user_schedules CASCADE;
DROP TABLE IF EXISTS user_completed_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS: stores login and profile info
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    email VARCHAR(100),
    grade VARCHAR(10),
    college VARCHAR(100)
);

-- COURSES: global catalog of UF courses (from API)
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255),
    credits INT,
    difficulty INT,
    professor VARCHAR(255)
);

-- USER_COMPLETED_COURSES: parsed from transcript
CREATE TABLE user_completed_courses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    grade VARCHAR(5),
    status VARCHAR(20) DEFAULT 'completed'  -- completed or in-progress
);

-- USER_SCHEDULES: backup schedules created by each user
CREATE TABLE user_schedules (
    schedule_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    name VARCHAR(100),                -- e.g. "Spring 2026 Plan A"
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCHEDULE_COURSES: courses in each backup schedule
CREATE TABLE schedule_courses (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES user_schedules(schedule_id) ON DELETE CASCADE,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE,
    day_of_week VARCHAR(10),          -- optional: "Mon", "Wed", "Fri"
    start_time TIME,                  -- optional: 09:35
    end_time TIME                     -- optional: 10:25
);