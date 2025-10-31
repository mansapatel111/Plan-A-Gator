DROP TABLE IF EXISTS schedule_courses CASCADE;
DROP TABLE IF EXISTS user_schedules CASCADE;
DROP TABLE IF EXISTS user_completed_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- USERS: stores login and profile info
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(128) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,  -- ✅ Added UNIQUE and NOT NULL
    grade VARCHAR(10),
    college VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- ✅ Added created_at
);

-- COURSES: global catalog of UF courses (from API)
CREATE TABLE courses (
    course_id SERIAL PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(255),
    credits INT DEFAULT 3,  -- ✅ Added default
    difficulty INT,
    professor VARCHAR(255)
);

-- USER_COMPLETED_COURSES: parsed from transcript
CREATE TABLE user_completed_courses (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE NOT NULL,
    grade VARCHAR(5),
    semester VARCHAR(20),  -- ✅ Added semester
    year INT,  -- ✅ Added year
    CONSTRAINT uix_user_course UNIQUE (user_id, course_id)  -- ✅ Added unique constraint
);

-- USER_SCHEDULES: backup schedules created by each user
CREATE TABLE user_schedules (
    schedule_id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,  -- ✅ Added NOT NULL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SCHEDULE_COURSES: courses in each backup schedule
CREATE TABLE schedule_courses (
    id SERIAL PRIMARY KEY,
    schedule_id INT REFERENCES user_schedules(schedule_id) ON DELETE CASCADE NOT NULL,
    course_id INT REFERENCES courses(course_id) ON DELETE CASCADE NOT NULL,
    day_of_week VARCHAR(10) NOT NULL,  -- ✅ Made NOT NULL
    start_time VARCHAR(10) NOT NULL,  -- ✅ Changed from TIME to VARCHAR(10)
    end_time VARCHAR(10)  -- ✅ Changed from TIME to VARCHAR(10)
);