from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    grade = db.Column(db.String(10))
    college = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    completed_courses = db.relationship('UserCompletedCourse', back_populates='user', cascade='all, delete-orphan')
    schedules = db.relationship('UserSchedule', back_populates='user', cascade='all, delete-orphan')

class Course(db.Model):
    __tablename__ = 'courses'
    course_id = db.Column(db.Integer, primary_key=True)
    course_code = db.Column(db.String(20), unique=True, nullable=False)
    course_name = db.Column(db.String(255))
    credits = db.Column(db.Integer, default=3)
    difficulty = db.Column(db.Integer)
    professor = db.Column(db.String(255))
    
    # Relationships
    completed_by = db.relationship('UserCompletedCourse', back_populates='course', cascade='all, delete-orphan')
    schedule_entries = db.relationship('ScheduleCourse', back_populates='course', cascade='all, delete-orphan')

class UserCompletedCourse(db.Model):
    __tablename__ = 'user_completed_courses'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)
    grade = db.Column(db.String(5))
    semester = db.Column(db.String(20))
    year = db.Column(db.Integer)
    
    # Relationships
    user = db.relationship('User', back_populates='completed_courses')
    course = db.relationship('Course', back_populates='completed_by')
    
    __table_args__ = (db.UniqueConstraint('user_id', 'course_id', name='uix_user_course'),)

class UserSchedule(db.Model):
    __tablename__ = 'user_schedules'
    schedule_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='schedules')
    schedule_courses = db.relationship('ScheduleCourse', back_populates='schedule', cascade='all, delete-orphan')

class ScheduleCourse(db.Model):
    __tablename__ = 'schedule_courses'
    id = db.Column(db.Integer, primary_key=True)
    schedule_id = db.Column(db.Integer, db.ForeignKey('user_schedules.schedule_id', ondelete='CASCADE'), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.course_id', ondelete='CASCADE'), nullable=False)
    day_of_week = db.Column(db.String(10), nullable=False)
    start_time = db.Column(db.String(10), nullable=False)
    end_time = db.Column(db.String(10))
    
    # Relationships
    schedule = db.relationship('UserSchedule', back_populates='schedule_courses')
    course = db.relationship('Course', back_populates='schedule_entries')