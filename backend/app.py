from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
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

#wire course recommendations to backend
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
    
    # Fetch additional course details from your database
    # for category in recommendations:
    #     for i, code in enumerate(recommendations[category]):
    #         course = Course.query.filter_by(course_code=code).first()
    #         if course:
    #             recommendations[category][i] = {
    #                 'code': code,
    #                 'name': course.course_name,
    #                 'credits': course.credits,
    #                 'instructor': course.professor,
    #                 'time': 'TBD'  # Add this to your Course model if needed
    #             }
    print("Recommendations:", recommendations)
    
    return jsonify({'recommendations': recommendations})

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

# @app.route('/save-transcript', methods=['POST'])
# def save_transcript():
#     data = request.get_json()
#     user_id = data.get('user_id')
#     classes = data.get('classes', [])  # list of course codes like ['COP3502', 'CDA3101']

#     # validate user exists
#     user = User.query.get(user_id)
#     if not user:
#         return jsonify({'error': 'User not found'}), 404

#     # normalize: strip whitespace, uppercase; preserve order and dedupe
#     normalized = []
#     seen = set()
#     for raw in classes:
#         if raw is None:
#             continue
#         code = re.sub(r"\s+", "", str(raw)).upper()
#         if not code:
#             continue
#         if code in seen:
#             continue
#         seen.add(code)
#         normalized.append(code)

#     saved_count = 0
#     try:
#         for code in normalized:
#             # find or create course
#             course = Course.query.filter_by(course_code=code).first()
#             if not course:
#                 course = Course(course_code=code)
#                 db.session.add(course)
#                 db.session.flush()

#             # Link to user if not exists
#             exists = UserCompletedCourse.query.filter_by(user_id=user_id, course_id=course.course_id).first()
#             if not exists:
#                 db.session.add(UserCompletedCourse(user_id=user_id, course_id=course.course_id))
#                 saved_count += 1

#         db.session.commit()
#     except Exception as e:
#         db.session.rollback()
#         return jsonify({'error': 'Failed to save transcript', 'details': str(e)}), 500

#     return jsonify({'message': f'{saved_count} courses saved to user record', 'saved_count': saved_count})


# @app.route('/db-info', methods=['GET'])
# def db_info():
#     # simple diagnostics to help debug permission/owner issues (local dev only)
#     try:
#         result = db.session.execute("SELECT current_user, session_user").first()
#         current_user, session_user = result[0], result[1]

#         owner_row = db.session.execute("SELECT tableowner FROM pg_tables WHERE tablename='users'").first()
#         table_owner = owner_row[0] if owner_row else None

#         grants = db.session.execute("SELECT grantee, privilege_type FROM information_schema.role_table_grants WHERE table_name='users'").fetchall()
#         grants_list = [{'grantee': r[0], 'privilege': r[1]} for r in grants]

#         return jsonify({'current_user': current_user, 'session_user': session_user, 'users_table_owner': table_owner, 'users_table_grants': grants_list})
#     except Exception as e:
#         return jsonify({'error': 'Failed to get db info', 'details': str(e)}), 500

# # Run server
if __name__ == "__main__":
    app.run(debug=os.getenv("DEBUG", "False") == "True")
