from app import db

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(100))
    grade = db.Column(db.String(10))
    college = db.Column(db.String(100))

class Course(db.Model):
    __tablename__ = 'courses'
    course_id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(255))
    credits = db.Column(db.Integer)
    difficulty = db.Column(db.Integer)
    professor = db.Column(db.String(255))

class UserCompletedCourse(db.Model):
    __tablename__ = 'user_completed_courses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id', ondelete='CASCADE'))
    grade = db.Column(db.String(5))
    status = db.Column(db.String(20), default='completed')

class UserSchedule(db.Model):
    __tablename__ = 'user_schedules'
    schedule_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'))
    name = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, server_default=db.func.now())

class ScheduleCourse(db.Model):
    __tablename__ = 'schedule_courses'
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('user_schedules.schedule_id', ondelete='CASCADE'))
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id', ondelete='CASCADE'))
    day_of_week = db.Column(db.String(10))
    start_time = db.Column(db.Time)
    end_time = db.Column(db.Time)
