from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from course_scraper import get_course_info
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from models import db, User, Course, UserCompletedCourse, UserSchedule, ScheduleCourse
import os
from sqlalchemy.exc import IntegrityError
import re
from recommendation_services import recommend_courses

# Load .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # allows frontend (React) to talk to backend 

# Database configuration (PostgreSQL)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)   # this initializes SQLAlchemy after app is created
bcrypt = Bcrypt(app)
#

with app.app_context():
    db.create_all()

app.secret_key = os.getenv("SECRET_KEY")

@app.route("/")
def index():
    return "Welcome to Plan A Gator Flask backend!"

@app.route("/api/hello", methods=["GET"])
def hello():
    return jsonify(message="Hello from Flask!")

@app.route("/api/upload", methods=["POST"])
def upload_transcript():
    file = request.files.get("file")
    if not file:
        return jsonify(error="No file uploaded"), 400
    # TODO: parse transcript here
    return jsonify(message="Transcript received!")

@app.route('/get-recommended-courses/<int:user_id>', methods=['GET'])
def get_recommended_courses(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get completed courses from database
        completed_courses = UserCompletedCourse.query.filter_by(user_id=user_id).all()
        completed_codes = [cc.course.course_code for cc in completed_courses if cc.course]
        
        # Get recommendations
        recommendations = recommend_courses(
            college=user.college or 'Engineering',  # Default if not set
            transcipt_codes=completed_codes
        )
        
        return jsonify({
            'courses': recommendations,
            'completed_courses': completed_codes
        })
        
    except Exception as e:
        print(f"Error getting recommended courses: {str(e)}")
        return jsonify({'error': 'Failed to get recommended courses'}), 500
    
#wire course recommendations to backend

# Real database routes
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    hashed_pw = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    new_user = User(
        username=data['username'],
        password_hash=hashed_pw,
        email=data.get('email'),
    )
    try:
        db.session.add(new_user)
        db.session.commit()
    except IntegrityError as e:
        db.session.rollback()
        # likely a unique constraint violation (username/email already exists)
        return jsonify({'error': 'User creation failed: User already exists', 'details': str(e.orig)}), 400
    except Exception as e:
        db.session.rollback()
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Unexpected database error', 'details': str(e)}), 500

    return jsonify({'message': 'User created successfully', 'user_id': new_user.user_id}), 201

@app.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        return jsonify({'message': 'Login successful', 'user_id': user.user_id})
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/update-user-info', methods=['POST'])
def update_user_info():
    data = request.get_json()
    user_id = data.get('user_id')
    grade = data.get('grade')
    college = data.get('college')

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    user.grade = grade
    user.college = college
    db.session.commit()
    return jsonify({'message': 'User info updated successfully'})

@app.route('/get-course-recommendations', methods=['GET'])
def get_recommendations():
    user_id = request.args.get('user_id')
    classes = request.args.get('classes', '')

    if not user_id:
        return jsonify({'error': 'Missing user_id'}), 400
        
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    print("college" + user.college)
    completed_courses = [c.strip().upper() for c in classes.split(',') if c.strip()]

    # Get recommendations using your service
    recommendations = recommend_courses(
        college=user.college,
        transcipt_codes=completed_courses
    )

    print("Recommendations:", recommendations)
    
    return jsonify({'recommendations': recommendations})

@app.route('/save-transcript', methods=['POST'])
def save_transcript():
    """Simplified version - store course codes directly"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        classes = data.get('classes', [])
        
        print(f"DEBUG - Save transcript: user_id={user_id}, classes={classes}")
        
        if not user_id:
            return jsonify({'error': 'User ID required'}), 400
        
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404

        # Normalize course codes
        normalized = []
        seen = set()
        for raw in classes:
            if raw is None:
                continue
            code = re.sub(r"\s+", "", str(raw)).upper()
            if not code or code in seen:
                continue
            seen.add(code)
            normalized.append(code)
        
        print(f"DEBUG - Normalized courses: {normalized}")

        saved_count = 0
        skipped = []
        errors = []
        
        for code in normalized:
            try:
                print(f"DEBUG - Processing course: {code}")
                
                # Step 1: Find or create Course entry
                print(f"DEBUG - Querying for course: {code}")
                course = Course.query.filter_by(course_code=code).first()
                print(f"DEBUG - Query result: {course}")
                
                if not course:
                    print(f"DEBUG - Creating new course: {code}")
                    course = Course(
                        course_code=code,
                        course_name=f"Course {code}",
                        credits=3
                    )
                    db.session.add(course)
                    db.session.flush()
                    print(f"DEBUG - Created course: {code} with course_id={course.course_id}")
                else:
                    print(f"DEBUG - Found existing course: {code} with course_id={course.course_id}")
                        
                # Step 2: Check if user already completed this course
                existing = UserCompletedCourse.query.filter_by(
                    user_id=user_id,
                    course_id=course.course_id
                ).first()
                
                if not existing:
                    # Step 3: Link user to course
                    user_course = UserCompletedCourse(
                        user_id=user_id,
                        course_id=course.course_id
                    )
                    db.session.add(user_course)
                    saved_count += 1
                    print(f"DEBUG - Linked user {user_id} to course {code} (id={course.course_id})")
                else:
                    skipped.append(code)
                    print(f"DEBUG - User {user_id} already has course {code}")
                    
            except Exception as course_error:
                error_msg = f"Error processing {code}: {str(course_error)}"
                print(f"ERROR - {error_msg}")
                import traceback
                traceback.print_exc()
                errors.append(error_msg)
                # ❌ DON'T rollback here - it will undo all previous additions!
                # Just continue to next course
                continue

        # Commit all successful additions at once
        if saved_count > 0:
            try:
                db.session.commit()
                print(f"SUCCESS - Saved {saved_count} courses for user {user_id}")
            except Exception as commit_error:
                db.session.rollback()
                print(f"ERROR - Commit failed: {str(commit_error)}")
                import traceback
                traceback.print_exc()
                return jsonify({'error': 'Failed to commit changes', 'details': str(commit_error)}), 500
        else:
            print(f"WARNING - No new courses to save for user {user_id}")
        
        return jsonify({
            'message': f'{saved_count} courses saved',
            'saved_count': saved_count,
            'total_courses': len(normalized),
            'skipped': skipped,
            'errors': errors if errors else None
        }), 200
        
    except Exception as e:
        db.session.rollback()
        print(f"ERROR - Save transcript failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to save transcript', 'details': str(e)}), 500
    
@app.route('/save-schedule', methods=['POST'])
def save_schedule():
    """Save user's schedule to database"""
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        schedule_name = data.get('name')
        schedule_data = data.get('schedule')  # The schedule object from frontend
        
        if not user_id or not schedule_name or not schedule_data:
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify user exists
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Create new schedule
        new_schedule = UserSchedule(
            user_id=user_id,
            name=schedule_name
        )
        db.session.add(new_schedule)
        db.session.flush()  # Get the schedule_id
        
        # Save each course in the schedule
        for time_slot, course_data in schedule_data.items():
            if course_data:  # If there's a course in this time slot
                try:
                    day, time = time_slot.split('-')
                except ValueError:
                    continue
                
                # Find or create the course
                course = Course.query.filter_by(course_code=course_data['code']).first()
                if not course:
                    course = Course(
                        course_code=course_data['code'],
                        course_name=course_data.get('name', f"Course {course_data['code']}"),
                        credits=course_data.get('credits', 3),
                        professor=course_data.get('instructor', 'TBD')
                    )
                    db.session.add(course)
                    db.session.flush()
                
                # Create schedule course entry
                schedule_course = ScheduleCourse(
                    schedule_id=new_schedule.schedule_id,
                    course_id=course.course_id,
                    day_of_week=day,
                    start_time=time
                )
                db.session.add(schedule_course)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Schedule saved successfully',
            'schedule_id': new_schedule.schedule_id
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Failed to save schedule: {str(e)}'}), 500

@app.route('/get-user-schedules/<int:user_id>', methods=['GET'])
def get_user_schedules(user_id):
    """Get all saved schedules for a user"""
    try:
        print(f"DEBUG - Getting schedules for user {user_id}")
        
        schedules = UserSchedule.query.filter_by(user_id=user_id).all()
        print(f"DEBUG - Found {len(schedules)} schedules")
        
        result = []
        for schedule in schedules:
            print(f"DEBUG - Processing schedule: {schedule.name} (id={schedule.schedule_id})")
            
            # ✅ Use schedule.schedule_courses instead of schedule.courses
            schedule_courses = schedule.schedule_courses
            print(f"DEBUG - Schedule has {len(schedule_courses)} courses")
            
            schedule_data = {}
            total_credits = 0
            unique_courses = set()
            
            for sched_course in schedule_courses:
                if sched_course.course:
                    time_slot = f"{sched_course.day_of_week}-{sched_course.start_time}"
                    schedule_data[time_slot] = {
                        'code': sched_course.course.course_code,
                        'name': sched_course.course.course_name or f"Course {sched_course.course.course_code}",
                        'credits': sched_course.course.credits or 3,
                        'instructor': sched_course.course.professor or 'TBD',
                        'time': sched_course.start_time,
                        'end_time': sched_course.end_time
                    }
                    unique_courses.add(sched_course.course.course_code)
                    total_credits += sched_course.course.credits or 3
            
            result.append({
                'id': schedule.schedule_id,
                'name': schedule.name,
                'schedule': schedule_data,
                'credits': total_credits,
                'courses': len(unique_courses),
                'created_at': schedule.created_at.isoformat() if schedule.created_at else None
            })
        
        print(f"DEBUG - Returning {len(result)} schedules")
        return jsonify({'schedules': result}), 200
        
    except Exception as e:
        print(f"ERROR - Failed to get schedules: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': 'Failed to get schedules', 'details': str(e)}), 500

@app.route('/delete-schedule/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    """Delete a saved schedule"""
    try:
        schedule = UserSchedule.query.get(schedule_id)
        if not schedule:
            return jsonify({'error': 'Schedule not found'}), 404
        
        db.session.delete(schedule)
        db.session.commit()
        
        return jsonify({'message': 'Schedule deleted successfully'})
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete schedule'}), 500

@app.route('/get-user-completed-courses/<int:user_id>', methods=['GET'])
def get_user_completed_courses(user_id):
    """Get user's completed courses"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        completed_courses = UserCompletedCourse.query.filter_by(user_id=user_id).all()
        courses_list = []
        
        for uc in completed_courses:
            if uc.course:
                courses_list.append(uc.course.course_code)

        return jsonify({
            'completed_courses': courses_list,
            'total_courses': len(courses_list)
        })
        
    except Exception as e:
        return jsonify({'error': 'Failed to get completed courses'}), 500
# # Run server

@app.route('/get-course-info/<course_code>', methods=['GET'])
def get_course_info_endpoint(course_code):
    try:
        course_info = get_course_info(course_code)
        if course_info.get('instructor'):
            from syllabus_scraper import get_ratemyprofessor_search_url
            course_info['rmp_url'] = get_ratemyprofessor_search_url(course_info['instructor'])
        
        return jsonify({
            'success': True,
            'course_info': course_info
        })
            
    except Exception as e:
        print(f"Error getting course info for {course_code}: {str(e)}")
        # Return basic info even if scraping fails
        return jsonify({
            'success': True,
            'course_info': {
                'code': course_code,
                'name': f"Course {course_code}",
                'credits': 3,
                'description': "Course information temporarily unavailable.",
                'prerequisites': "Check with academic advisor",
                'syllabus_url': None,
                'rpm_url': None
            }
        })
    

    
if __name__ == "__main__":
    app.run(debug=os.getenv("DEBUG", "False") == "True")
