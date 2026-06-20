"""Setup script: writes all SQLAlchemy model files."""
import os

BASE = r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\backend"

files = {}

# ========== USER MODEL ==========
files["app/models/user.py"] = """\
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"
    parent = "parent"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SAEnum(UserRole), nullable=False)
    phone = Column(String(20), nullable=True)
    profile_photo = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expiry = Column(DateTime, nullable=True)

    # Relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    attendance_marked = relationship(
        "Attendance", foreign_keys="Attendance.marked_by_id", back_populates="marked_by"
    )
    audit_logs = relationship("AuditLog", back_populates="user", cascade="all, delete-orphan")
"""

# ========== STUDENT PROFILE ==========
files["app/models/student.py"] = """\
from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=True)
    class_name = Column(String(100), nullable=True)
    section = Column(String(20), nullable=True)
    semester = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)
    parent_email = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String(500), nullable=True)

    user = relationship("User", back_populates="student_profile")
"""

# ========== TEACHER PROFILE ==========
files["app/models/teacher.py"] = """\
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=True)
    qualification = Column(String(255), nullable=True)
    experience_years = Column(Integer, nullable=True)
    subjects_taught = Column(String(500), nullable=True)

    user = relationship("User", back_populates="teacher_profile")
"""

# ========== SUBJECT ==========
files["app/models/subject.py"] = """\
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, index=True, nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    class_name = Column(String(100), nullable=True)
    section = Column(String(20), nullable=True)
    semester = Column(Integer, nullable=True)
    credits = Column(Integer, default=3)

    teacher = relationship("User", foreign_keys=[teacher_id], backref="subjects_teaching")
    assignments = relationship("Assignment", back_populates="subject")
    attendance_records = relationship("Attendance", back_populates="subject")
    exams = relationship("Exam", back_populates="subject")
    timetable_slots = relationship("Timetable", back_populates="subject")
"""

# ========== ATTENDANCE ==========
files["app/models/attendance.py"] = """\
from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(SAEnum(AttendanceStatus), nullable=False, default=AttendanceStatus.present)
    marked_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], backref="attendances")
    subject = relationship("Subject", back_populates="attendance_records")
    marked_by = relationship("User", foreign_keys=[marked_by_id], back_populates="attendance_marked")
"""

# ========== ASSIGNMENT + SUBMISSION ==========
files["app/models/assignment.py"] = """\
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class SubmissionStatus(str, enum.Enum):
    submitted = "submitted"
    graded = "graded"
    late = "late"


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    deadline = Column(DateTime, nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=True)
    max_marks = Column(Float, default=100.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="assignments")
    teacher = relationship("User", foreign_keys=[teacher_id], backref="created_assignments")
    submissions = relationship("Submission", back_populates="assignment", cascade="all, delete-orphan")


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    file_path = Column(String(500), nullable=True)
    text_content = Column(Text, nullable=True)
    submitted_at = Column(DateTime, default=datetime.utcnow)
    grade = Column(String(10), nullable=True)
    feedback = Column(Text, nullable=True)
    marks_obtained = Column(Float, nullable=True)
    status = Column(SAEnum(SubmissionStatus), default=SubmissionStatus.submitted)

    assignment = relationship("Assignment", back_populates="submissions")
    student = relationship("User", foreign_keys=[student_id], backref="submissions")
"""

# ========== EXAM + MARK ==========
files["app/models/exam.py"] = """\
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ExamType(str, enum.Enum):
    midterm = "midterm"
    final = "final"
    quiz = "quiz"
    practical = "practical"


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    exam_date = Column(DateTime, nullable=False)
    exam_type = Column(SAEnum(ExamType), nullable=False, default=ExamType.midterm)
    total_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=40.0)
    duration_minutes = Column(Integer, default=180)
    class_name = Column(String(100), nullable=True)
    section = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="exams")
    marks = relationship("Mark", back_populates="exam", cascade="all, delete-orphan")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    grade = Column(String(5), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], backref="marks")
    exam = relationship("Exam", back_populates="marks")
"""

# ========== FEE ==========
files["app/models/fee.py"] = """\
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class FeeStatus(str, enum.Enum):
    paid = "paid"
    unpaid = "unpaid"
    partial = "partial"
    overdue = "overdue"


class Fee(Base):
    __tablename__ = "fees"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Float, nullable=False)
    fee_type = Column(String(100), default="tuition")
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False)
    payment_date = Column(DateTime, nullable=True)
    status = Column(SAEnum(FeeStatus), default=FeeStatus.unpaid)
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], backref="fees")
"""

# ========== NOTICE ==========
files["app/models/notice.py"] = """\
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class TargetRole(str, enum.Enum):
    all = "all"
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"


class Notice(Base):
    __tablename__ = "notices"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    target_role = Column(SAEnum(TargetRole), default=TargetRole.all)
    is_active = Column(Integer, default=1)

    created_by = relationship("User", foreign_keys=[created_by_id], backref="notices")
"""

# ========== NOTIFICATION ==========
files["app/models/notification.py"] = """\
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="general")
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")
"""

# ========== TIMETABLE ==========
files["app/models/timetable.py"] = """\
from sqlalchemy import Column, Integer, String, Time, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(100), nullable=False, index=True)
    section = Column(String(20), nullable=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    teacher_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    day_of_week = Column(String(15), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    room = Column(String(50), nullable=True)

    subject = relationship("Subject", back_populates="timetable_slots")
    teacher = relationship("User", foreign_keys=[teacher_id], backref="timetable_slots")
"""

# ========== LEAVE ==========
files["app/models/leave.py"] = """\
from sqlalchemy import Column, Integer, Text, Date, DateTime, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class LeaveStatus(str, enum.Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class Leave(Base):
    __tablename__ = "leaves"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reason = Column(Text, nullable=False)
    from_date = Column(Date, nullable=False)
    to_date = Column(Date, nullable=False)
    status = Column(SAEnum(LeaveStatus), default=LeaveStatus.pending)
    applied_at = Column(DateTime, default=datetime.utcnow)
    reviewed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    review_remarks = Column(Text, nullable=True)

    student = relationship("User", foreign_keys=[student_id], backref="leaves")
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id], backref="reviewed_leaves")
"""

# ========== AUDIT LOG ==========
files["app/models/audit.py"] = """\
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="audit_logs")
"""

# ========== MODELS __init__ ==========
files["app/models/__init__.py"] = """\
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.teacher import TeacherProfile
from app.models.subject import Subject
from app.models.attendance import Attendance, AttendanceStatus
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.exam import Exam, Mark, ExamType
from app.models.fee import Fee, FeeStatus
from app.models.notice import Notice, TargetRole
from app.models.notification import Notification
from app.models.timetable import Timetable
from app.models.leave import Leave, LeaveStatus
from app.models.audit import AuditLog

__all__ = [
    "User", "UserRole",
    "StudentProfile", "TeacherProfile",
    "Subject",
    "Attendance", "AttendanceStatus",
    "Assignment", "Submission", "SubmissionStatus",
    "Exam", "Mark", "ExamType",
    "Fee", "FeeStatus",
    "Notice", "TargetRole",
    "Notification",
    "Timetable",
    "Leave", "LeaveStatus",
    "AuditLog",
]
"""

# Write all files
for rel_path, content in files.items():
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {rel_path}")

print("\nAll model files written successfully.")
