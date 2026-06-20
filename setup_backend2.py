"""Writes all backend files using proper string handling."""
import os

BASE = r"c:\Users\iSN_kota_T52\Desktop\rag pipeline\backend"

def w(rel_path, content):
    full_path = os.path.join(BASE, rel_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Written: {rel_path}")

# ============ SCHEMAS ============

w("app/schemas/__init__.py", "")

w("app/schemas/user.py", '''from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class StudentRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    roll_number: str
    department: Optional[str] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    year: Optional[int] = None
    parent_email: Optional[EmailStr] = None
    address: Optional[str] = None


class TeacherRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None
    employee_id: str
    department: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None


class AdminRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    phone: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    phone: Optional[str]
    profile_photo: Optional[str]
    is_active: bool
    created_at: datetime
    last_login: Optional[datetime]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
''')

w("app/schemas/attendance.py", '''from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime


class AttendanceCreate(BaseModel):
    student_id: int
    subject_id: Optional[int] = None
    date: date
    status: str


class AttendanceBulkCreate(BaseModel):
    subject_id: Optional[int] = None
    date: date
    records: List[dict]


class AttendanceOut(BaseModel):
    id: int
    student_id: int
    subject_id: Optional[int]
    date: date
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
''')

w("app/schemas/assignment.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AssignmentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: datetime
    subject_id: Optional[int] = None
    max_marks: float = 100.0


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    max_marks: Optional[float] = None


class AssignmentOut(BaseModel):
    id: int
    title: str
    description: Optional[str]
    deadline: datetime
    subject_id: Optional[int]
    teacher_id: int
    file_path: Optional[str]
    max_marks: float
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SubmissionCreate(BaseModel):
    text_content: Optional[str] = None


class GradeSubmission(BaseModel):
    marks_obtained: float
    grade: Optional[str] = None
    feedback: Optional[str] = None


class SubmissionOut(BaseModel):
    id: int
    assignment_id: int
    student_id: int
    file_path: Optional[str]
    text_content: Optional[str]
    submitted_at: datetime
    grade: Optional[str]
    feedback: Optional[str]
    marks_obtained: Optional[float]
    status: str

    class Config:
        from_attributes = True
''')

w("app/schemas/exam.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ExamCreate(BaseModel):
    title: str
    subject_id: Optional[int] = None
    exam_date: datetime
    exam_type: str = "midterm"
    total_marks: float = 100.0
    passing_marks: float = 40.0
    duration_minutes: int = 180
    class_name: Optional[str] = None
    section: Optional[str] = None


class ExamOut(BaseModel):
    id: int
    title: str
    subject_id: Optional[int]
    exam_date: datetime
    exam_type: str
    total_marks: float
    passing_marks: float
    duration_minutes: int
    class_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class MarkCreate(BaseModel):
    student_id: int
    exam_id: int
    marks_obtained: float
    grade: Optional[str] = None
    remarks: Optional[str] = None


class MarkOut(BaseModel):
    id: int
    student_id: int
    exam_id: int
    marks_obtained: float
    grade: Optional[str]
    remarks: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
''')

w("app/schemas/fee.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class FeeCreate(BaseModel):
    student_id: int
    amount: float
    fee_type: str = "tuition"
    description: Optional[str] = None
    due_date: datetime


class FeeUpdate(BaseModel):
    status: Optional[str] = None
    payment_date: Optional[datetime] = None
    transaction_id: Optional[str] = None


class FeeOut(BaseModel):
    id: int
    student_id: int
    amount: float
    fee_type: str
    description: Optional[str]
    due_date: datetime
    payment_date: Optional[datetime]
    status: str
    transaction_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
''')

w("app/schemas/notice.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoticeCreate(BaseModel):
    title: str
    description: str
    target_role: str = "all"


class NoticeOut(BaseModel):
    id: int
    title: str
    description: str
    created_by_id: Optional[int]
    created_at: datetime
    target_role: str
    is_active: int

    class Config:
        from_attributes = True
''')

w("app/schemas/subject.py", '''from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    name: str
    code: str
    teacher_id: Optional[int] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    credits: int = 3


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    teacher_id: Optional[int]
    class_name: Optional[str]
    section: Optional[str]
    semester: Optional[int]
    credits: int

    class Config:
        from_attributes = True
''')

w("app/schemas/leave.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class LeaveCreate(BaseModel):
    reason: str
    from_date: date
    to_date: date


class LeaveReview(BaseModel):
    status: str
    review_remarks: Optional[str] = None


class LeaveOut(BaseModel):
    id: int
    student_id: int
    reason: str
    from_date: date
    to_date: date
    status: str
    applied_at: datetime
    reviewed_by_id: Optional[int]
    review_remarks: Optional[str]

    class Config:
        from_attributes = True
''')

w("app/schemas/timetable.py", '''from pydantic import BaseModel
from typing import Optional
from datetime import time


class TimetableCreate(BaseModel):
    class_name: str
    section: Optional[str] = None
    subject_id: Optional[int] = None
    teacher_id: Optional[int] = None
    day_of_week: str
    start_time: time
    end_time: time
    room: Optional[str] = None


class TimetableOut(BaseModel):
    id: int
    class_name: str
    section: Optional[str]
    subject_id: Optional[int]
    teacher_id: Optional[int]
    day_of_week: str
    start_time: time
    end_time: time
    room: Optional[str]

    class Config:
        from_attributes = True
''')

# ============ UTILS ============

w("app/utils/__init__.py", "")

w("app/utils/password_handler.py", '''from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)
''')

w("app/utils/jwt_handler.py", '''from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import HTTPException, status
from app.config import settings


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)


def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
''')

w("app/utils/auth_deps.py", '''from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.utils.jwt_handler import verify_token
from app.database import get_db
from app.models.user import User

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    payload = verify_token(token)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    return user


def require_role(*roles: str):
    def checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
            )
        return current_user
    return checker


require_admin = require_role("admin")
require_teacher = require_role("teacher", "admin")
require_student = require_role("student")
require_teacher_or_admin = require_role("teacher", "admin")
''')

w("app/utils/helpers.py", '''import secrets
import string


def generate_reset_token(length: int = 64) -> str:
    alphabet = string.ascii_letters + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def calculate_grade(marks: float, total: float) -> str:
    pct = (marks / total) * 100 if total > 0 else 0
    if pct >= 90:
        return "A+"
    elif pct >= 80:
        return "A"
    elif pct >= 70:
        return "B+"
    elif pct >= 60:
        return "B"
    elif pct >= 50:
        return "C"
    elif pct >= 40:
        return "D"
    return "F"
''')

# ============ ROUTERS ============

w("app/routers/__init__.py", "")

w("app/routers/auth.py", '''from fastapi import APIRouter, HTTPException, status, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.teacher import TeacherProfile
from app.models.audit import AuditLog
from app.schemas.user import (
    StudentRegister, TeacherRegister, AdminRegister,
    UserLogin, ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest,
)
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.helpers import generate_reset_token
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


def _user_out(user: User, db: Session) -> dict:
    data = {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "role": user.role.value, "phone": user.phone,
        "profile_photo": user.profile_photo, "is_active": user.is_active,
        "created_at": user.created_at, "last_login": user.last_login,
    }
    if user.role == UserRole.student and user.student_profile:
        sp = user.student_profile
        data.update({"roll_number": sp.roll_number, "department": sp.department,
                     "class_name": sp.class_name, "section": sp.section,
                     "semester": sp.semester, "year": sp.year})
    if user.role == UserRole.teacher and user.teacher_profile:
        tp = user.teacher_profile
        data.update({"employee_id": tp.employee_id, "department": tp.department})
    return data


@router.post("/login")
def login(creds: UserLogin, request: Request, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    if not user or not verify_password(creds.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
    user.last_login = datetime.utcnow()
    db.add(AuditLog(user_id=user.id, action="login",
                    ip_address=request.client.host if request.client else None))
    db.commit()
    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return {"access_token": token, "token_type": "bearer", "user": _user_out(user, db)}


@router.post("/register/student", status_code=201)
def register_student(data: StudentRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(StudentProfile).filter(StudentProfile.roll_number == data.roll_number).first():
        raise HTTPException(status_code=400, detail="Roll number already exists")
    user = User(email=data.email, full_name=data.full_name,
                hashed_password=hash_password(data.password),
                role=UserRole.student, phone=data.phone)
    db.add(user)
    db.flush()
    profile = StudentProfile(
        user_id=user.id, roll_number=data.roll_number,
        department=data.department, class_name=data.class_name,
        section=data.section, semester=data.semester, year=data.year,
        parent_email=data.parent_email, address=data.address,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return {"message": "Student registered successfully", "user_id": user.id}


@router.post("/register/teacher", status_code=201)
def register_teacher(data: TeacherRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(TeacherProfile).filter(TeacherProfile.employee_id == data.employee_id).first():
        raise HTTPException(status_code=400, detail="Employee ID already exists")
    user = User(email=data.email, full_name=data.full_name,
                hashed_password=hash_password(data.password),
                role=UserRole.teacher, phone=data.phone)
    db.add(user)
    db.flush()
    profile = TeacherProfile(
        user_id=user.id, employee_id=data.employee_id,
        department=data.department, qualification=data.qualification,
        experience_years=data.experience_years,
    )
    db.add(profile)
    db.commit()
    db.refresh(user)
    return {"message": "Teacher registered successfully", "user_id": user.id}


@router.post("/register/admin", status_code=201)
def register_admin(data: AdminRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(email=data.email, full_name=data.full_name,
                hashed_password=hash_password(data.password),
                role=UserRole.admin, phone=data.phone)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "Admin registered successfully", "user_id": user.id}


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return _user_out(current_user, db)


@router.post("/forgot-password")
def forgot_password(data: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        token = generate_reset_token()
        user.reset_token = token
        user.reset_token_expiry = datetime.utcnow() + timedelta(hours=1)
        db.commit()
    return {"message": "If that email is registered, a reset link has been sent."}


@router.post("/reset-password")
def reset_password(data: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == data.token).first()
    if not user or (user.reset_token_expiry and user.reset_token_expiry < datetime.utcnow()):
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
    user.hashed_password = hash_password(data.new_password)
    user.reset_token = None
    user.reset_token_expiry = None
    db.commit()
    return {"message": "Password reset successfully"}


@router.post("/change-password")
def change_password(data: ChangePasswordRequest,
                    current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
''')

w("app/routers/students.py", '''from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.attendance import Attendance
from app.models.exam import Mark, Exam
from app.models.assignment import Assignment, Submission
from app.models.fee import Fee
from app.utils.auth_deps import get_current_user, require_teacher_or_admin, require_student

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("")
def list_students(
    search: Optional[str] = None,
    class_name: Optional[str] = None,
    department: Optional[str] = None,
    skip: int = 0, limit: int = 50,
    _=Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    q = (db.query(User, StudentProfile)
         .join(StudentProfile, User.id == StudentProfile.user_id)
         .filter(User.role == UserRole.student, User.is_active == True))
    if search:
        q = q.filter(
            User.full_name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%") |
            StudentProfile.roll_number.ilike(f"%{search}%"))
    if class_name:
        q = q.filter(StudentProfile.class_name == class_name)
    if department:
        q = q.filter(StudentProfile.department == department)
    total = q.count()
    results = q.offset(skip).limit(limit).all()
    return {"total": total, "students": [
        {"id": u.id, "email": u.email, "full_name": u.full_name,
         "phone": u.phone, "profile_photo": u.profile_photo,
         "roll_number": sp.roll_number, "department": sp.department,
         "class_name": sp.class_name, "section": sp.section,
         "semester": sp.semester, "year": sp.year, "created_at": u.created_at}
        for u, sp in results]}


@router.get("/profile")
def my_profile(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    sp = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    return {
        "id": current_user.id, "email": current_user.email, "full_name": current_user.full_name,
        "phone": current_user.phone, "profile_photo": current_user.profile_photo,
        "roll_number": sp.roll_number if sp else None,
        "department": sp.department if sp else None,
        "class_name": sp.class_name if sp else None,
        "section": sp.section if sp else None,
        "semester": sp.semester if sp else None,
        "year": sp.year if sp else None,
    }


@router.get("/attendance")
def my_attendance(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.student_id == current_user.id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    pct = round((present / total) * 100, 2) if total > 0 else 0
    return {
        "total_classes": total, "present": present, "absent": total - present,
        "percentage": pct,
        "records": [{"id": r.id, "date": r.date, "status": r.status.value,
                     "subject_id": r.subject_id} for r in records],
    }


@router.get("/marks")
def my_marks(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    marks = (db.query(Mark, Exam).join(Exam, Mark.exam_id == Exam.id)
             .filter(Mark.student_id == current_user.id).all())
    return {"marks": [
        {"id": m.id, "exam_title": e.title, "exam_type": e.exam_type.value,
         "subject_id": e.subject_id, "marks_obtained": m.marks_obtained,
         "total_marks": e.total_marks,
         "percentage": round((m.marks_obtained / e.total_marks) * 100, 2),
         "grade": m.grade, "remarks": m.remarks, "exam_date": e.exam_date}
        for m, e in marks]}


@router.get("/assignments")
def my_assignments(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.is_active == True).all()
    result = []
    for a in assignments:
        sub = db.query(Submission).filter(
            Submission.assignment_id == a.id, Submission.student_id == current_user.id).first()
        result.append({
            "id": a.id, "title": a.title, "description": a.description,
            "deadline": a.deadline, "subject_id": a.subject_id, "max_marks": a.max_marks,
            "submitted": sub is not None,
            "submission": {"id": sub.id, "status": sub.status.value,
                           "marks_obtained": sub.marks_obtained, "grade": sub.grade,
                           "submitted_at": sub.submitted_at} if sub else None,
        })
    return {"assignments": result}


@router.get("/fees")
def my_fees(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    fees = db.query(Fee).filter(Fee.student_id == current_user.id).all()
    total = sum(f.amount for f in fees)
    paid = sum(f.amount for f in fees if f.status.value == "paid")
    return {
        "total_amount": total, "paid_amount": paid, "pending_amount": total - paid,
        "fees": [{"id": f.id, "amount": f.amount, "fee_type": f.fee_type,
                  "description": f.description, "due_date": f.due_date,
                  "payment_date": f.payment_date, "status": f.status.value,
                  "transaction_id": f.transaction_id} for f in fees],
    }


@router.get("/{student_id}")
def get_student(student_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == UserRole.student).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    sp = db.query(StudentProfile).filter(StudentProfile.user_id == student_id).first()
    return {"id": user.id, "email": user.email, "full_name": user.full_name,
            "phone": user.phone, "roll_number": sp.roll_number if sp else None,
            "department": sp.department if sp else None, "class_name": sp.class_name if sp else None}


@router.delete("/{student_id}")
def delete_student(student_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == student_id, User.role == UserRole.student).first()
    if not user:
        raise HTTPException(status_code=404, detail="Student not found")
    user.is_active = False
    db.commit()
    return {"message": "Student deactivated"}
''')

w("app/routers/teachers.py", '''from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.teacher import TeacherProfile
from app.utils.auth_deps import require_admin, require_teacher_or_admin

router = APIRouter(prefix="/api/teachers", tags=["Teachers"])


@router.get("")
def list_teachers(
    search: Optional[str] = None, skip: int = 0, limit: int = 50,
    _=Depends(require_admin), db: Session = Depends(get_db),
):
    q = (db.query(User, TeacherProfile)
         .join(TeacherProfile, User.id == TeacherProfile.user_id)
         .filter(User.role == UserRole.teacher, User.is_active == True))
    if search:
        q = q.filter(User.full_name.ilike(f"%{search}%") | TeacherProfile.employee_id.ilike(f"%{search}%"))
    total = q.count()
    results = q.offset(skip).limit(limit).all()
    return {"total": total, "teachers": [
        {"id": u.id, "email": u.email, "full_name": u.full_name, "phone": u.phone,
         "employee_id": tp.employee_id, "department": tp.department,
         "qualification": tp.qualification, "experience_years": tp.experience_years,
         "created_at": u.created_at} for u, tp in results]}


@router.get("/profile")
def teacher_profile(current_user: User = Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    tp = db.query(TeacherProfile).filter(TeacherProfile.user_id == current_user.id).first()
    return {"id": current_user.id, "email": current_user.email, "full_name": current_user.full_name,
            "phone": current_user.phone, "employee_id": tp.employee_id if tp else None,
            "department": tp.department if tp else None}


@router.delete("/{teacher_id}")
def delete_teacher(teacher_id: int, _=Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == teacher_id, User.role == UserRole.teacher).first()
    if not user:
        raise HTTPException(status_code=404, detail="Teacher not found")
    user.is_active = False
    db.commit()
    return {"message": "Teacher deactivated"}
''')

w("app/routers/attendance.py", '''from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.attendance import Attendance, AttendanceStatus
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceBulkCreate
from app.utils.auth_deps import get_current_user, require_teacher_or_admin

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("", status_code=201)
def mark_attendance(
    data: AttendanceCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    existing = db.query(Attendance).filter(
        Attendance.student_id == data.student_id,
        Attendance.date == data.date,
        Attendance.subject_id == data.subject_id,
    ).first()
    if existing:
        existing.status = AttendanceStatus(data.status)
        existing.marked_by_id = current_user.id
        db.commit()
        return {"message": "Attendance updated", "id": existing.id}
    record = Attendance(
        student_id=data.student_id, subject_id=data.subject_id,
        date=data.date, status=AttendanceStatus(data.status),
        marked_by_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return {"message": "Attendance marked", "id": record.id}


@router.post("/bulk", status_code=201)
def bulk_attendance(
    data: AttendanceBulkCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    for rec in data.records:
        student_id = rec.get("student_id")
        status_str = rec.get("status", "present")
        existing = db.query(Attendance).filter(
            Attendance.student_id == student_id,
            Attendance.date == data.date,
            Attendance.subject_id == data.subject_id,
        ).first()
        if existing:
            existing.status = AttendanceStatus(status_str)
        else:
            db.add(Attendance(student_id=student_id, subject_id=data.subject_id,
                              date=data.date, status=AttendanceStatus(status_str),
                              marked_by_id=current_user.id))
    db.commit()
    return {"message": f"Attendance marked for {len(data.records)} students"}


@router.get("/student/{student_id}")
def student_attendance(student_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    return {
        "total": total, "present": present, "absent": total - present,
        "percentage": round((present / total) * 100, 2) if total > 0 else 0,
        "records": [{"id": r.id, "date": r.date, "status": r.status.value,
                     "subject_id": r.subject_id} for r in records],
    }


@router.get("/overview")
def attendance_overview(_=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    records = db.query(Attendance).all()
    present = sum(1 for r in records if r.status.value == "present")
    absent = sum(1 for r in records if r.status.value == "absent")
    return {"total": len(records), "present": present, "absent": absent}
''')

w("app/routers/assignments.py", '''from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional
import os, shutil

from app.database import get_db
from app.models.assignment import Assignment, Submission, SubmissionStatus
from app.models.user import User
from app.schemas.assignment import AssignmentCreate, AssignmentUpdate, GradeSubmission
from app.utils.auth_deps import get_current_user, require_teacher_or_admin, require_student
from app.config import settings

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


@router.get("")
def list_assignments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    assignments = db.query(Assignment).filter(Assignment.is_active == True).all()
    return {"assignments": [
        {"id": a.id, "title": a.title, "description": a.description,
         "deadline": a.deadline, "subject_id": a.subject_id,
         "teacher_id": a.teacher_id, "max_marks": a.max_marks, "created_at": a.created_at}
        for a in assignments]}


@router.post("", status_code=201)
def create_assignment(
    data: AssignmentCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    assignment = Assignment(title=data.title, description=data.description,
                            deadline=data.deadline, subject_id=data.subject_id,
                            teacher_id=current_user.id, max_marks=data.max_marks)
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {"message": "Assignment created", "id": assignment.id}


@router.put("/{assignment_id}")
def update_assignment(
    assignment_id: int, data: AssignmentUpdate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    a = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    for field, val in data.model_dump(exclude_none=True).items():
        setattr(a, field, val)
    db.commit()
    return {"message": "Assignment updated"}


@router.delete("/{assignment_id}")
def delete_assignment(assignment_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    a = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    a.is_active = False
    db.commit()
    return {"message": "Assignment deleted"}


@router.post("/{assignment_id}/submit", status_code=201)
def submit_assignment(
    assignment_id: int,
    text_content: Optional[str] = None,
    file: Optional[UploadFile] = File(None),
    current_user: User = Depends(require_student),
    db: Session = Depends(get_db),
):
    a = db.query(Assignment).filter(Assignment.id == assignment_id, Assignment.is_active == True).first()
    if not a:
        raise HTTPException(status_code=404, detail="Assignment not found")
    existing = db.query(Submission).filter(
        Submission.assignment_id == assignment_id, Submission.student_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Already submitted")
    file_path = None
    if file:
        dest = os.path.join(settings.upload_dir, "submissions")
        os.makedirs(dest, exist_ok=True)
        fname = f"{assignment_id}_{current_user.id}_{file.filename}"
        file_path = os.path.join(dest, fname)
        with open(file_path, "wb") as f_out:
            shutil.copyfileobj(file.file, f_out)
    is_late = datetime.utcnow() > a.deadline
    sub = Submission(assignment_id=assignment_id, student_id=current_user.id,
                     text_content=text_content, file_path=file_path,
                     status=SubmissionStatus.late if is_late else SubmissionStatus.submitted)
    db.add(sub)
    db.commit()
    return {"message": "Assignment submitted", "late": is_late}


@router.get("/{assignment_id}/submissions")
def get_submissions(assignment_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    subs = db.query(Submission).filter(Submission.assignment_id == assignment_id).all()
    return {"submissions": [
        {"id": s.id, "student_id": s.student_id, "status": s.status.value,
         "submitted_at": s.submitted_at, "marks_obtained": s.marks_obtained,
         "grade": s.grade, "feedback": s.feedback} for s in subs]}


@router.put("/submissions/{submission_id}/grade")
def grade_submission(
    submission_id: int, data: GradeSubmission,
    _=Depends(require_teacher_or_admin), db: Session = Depends(get_db),
):
    sub = db.query(Submission).filter(Submission.id == submission_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Submission not found")
    sub.marks_obtained = data.marks_obtained
    sub.grade = data.grade
    sub.feedback = data.feedback
    sub.status = SubmissionStatus.graded
    db.commit()
    return {"message": "Submission graded"}
''')

w("app/routers/exams.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.exam import Exam, Mark
from app.models.user import User
from app.schemas.exam import ExamCreate, MarkCreate
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import calculate_grade

router = APIRouter(prefix="/api/exams", tags=["Exams & Marks"])


@router.get("")
def list_exams(
    class_name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Exam)
    if class_name:
        q = q.filter(Exam.class_name == class_name)
    exams = q.order_by(Exam.exam_date.desc()).all()
    return {"exams": [
        {"id": e.id, "title": e.title, "exam_type": e.exam_type.value,
         "exam_date": e.exam_date, "total_marks": e.total_marks,
         "subject_id": e.subject_id, "class_name": e.class_name} for e in exams]}


@router.post("", status_code=201)
def create_exam(data: ExamCreate, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    from app.models.exam import ExamType
    exam = Exam(
        title=data.title, subject_id=data.subject_id, exam_date=data.exam_date,
        exam_type=ExamType(data.exam_type), total_marks=data.total_marks,
        passing_marks=data.passing_marks, duration_minutes=data.duration_minutes,
        class_name=data.class_name, section=data.section,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return {"message": "Exam created", "id": exam.id}


@router.post("/marks", status_code=201)
def add_marks(data: MarkCreate, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    existing = db.query(Mark).filter(Mark.student_id == data.student_id, Mark.exam_id == data.exam_id).first()
    grade = data.grade or calculate_grade(data.marks_obtained, exam.total_marks)
    if existing:
        existing.marks_obtained = data.marks_obtained
        existing.grade = grade
        existing.remarks = data.remarks
        db.commit()
        return {"message": "Marks updated"}
    mark = Mark(student_id=data.student_id, exam_id=data.exam_id,
                marks_obtained=data.marks_obtained, grade=grade, remarks=data.remarks)
    db.add(mark)
    db.commit()
    return {"message": "Marks added"}


@router.get("/{exam_id}/marks")
def get_exam_marks(exam_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    marks = db.query(Mark).filter(Mark.exam_id == exam_id).all()
    return {"marks": [{"id": m.id, "student_id": m.student_id,
                        "marks_obtained": m.marks_obtained, "grade": m.grade} for m in marks]}
''')

w("app/routers/fees.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.fee import Fee, FeeStatus
from app.schemas.fee import FeeCreate, FeeUpdate
from app.utils.auth_deps import require_admin

router = APIRouter(prefix="/api/fees", tags=["Fees"])


@router.get("")
def list_all_fees(status: Optional[str] = None, _=Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Fee)
    if status:
        q = q.filter(Fee.status == FeeStatus(status))
    fees = q.all()
    return {"fees": [{"id": f.id, "student_id": f.student_id, "amount": f.amount,
                       "fee_type": f.fee_type, "status": f.status.value,
                       "due_date": f.due_date, "payment_date": f.payment_date} for f in fees]}


@router.post("", status_code=201)
def create_fee(data: FeeCreate, _=Depends(require_admin), db: Session = Depends(get_db)):
    fee = Fee(**data.model_dump())
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return {"message": "Fee record created", "id": fee.id}


@router.put("/{fee_id}/pay")
def pay_fee(fee_id: int, data: FeeUpdate, _=Depends(require_admin), db: Session = Depends(get_db)):
    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    fee.status = FeeStatus(data.status) if data.status else FeeStatus.paid
    fee.payment_date = data.payment_date or datetime.utcnow()
    fee.transaction_id = data.transaction_id
    db.commit()
    return {"message": "Fee payment recorded"}


@router.get("/stats")
def fee_stats(_=Depends(require_admin), db: Session = Depends(get_db)):
    all_fees = db.query(Fee).all()
    total = sum(f.amount for f in all_fees)
    paid = sum(f.amount for f in all_fees if f.status.value == "paid")
    return {"total": total, "paid": paid, "pending": total - paid,
            "count_paid": sum(1 for f in all_fees if f.status.value == "paid"),
            "count_unpaid": sum(1 for f in all_fees if f.status.value != "paid")}
''')

w("app/routers/notices.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notice import Notice, TargetRole
from app.models.user import User
from app.schemas.notice import NoticeCreate
from app.utils.auth_deps import get_current_user, require_teacher_or_admin

router = APIRouter(prefix="/api/notices", tags=["Notices"])


@router.get("")
def list_notices(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    role = current_user.role.value
    notices = db.query(Notice).filter(
        Notice.is_active == 1,
        (Notice.target_role == TargetRole.all) | (Notice.target_role == TargetRole(role))
    ).order_by(Notice.created_at.desc()).all()
    return {"notices": [
        {"id": n.id, "title": n.title, "description": n.description,
         "created_at": n.created_at, "target_role": n.target_role.value,
         "created_by_id": n.created_by_id} for n in notices]}


@router.post("", status_code=201)
def create_notice(
    data: NoticeCreate,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    notice = Notice(title=data.title, description=data.description,
                    target_role=TargetRole(data.target_role), created_by_id=current_user.id)
    db.add(notice)
    db.commit()
    db.refresh(notice)
    return {"message": "Notice published", "id": notice.id}


@router.delete("/{notice_id}")
def delete_notice(notice_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    n = db.query(Notice).filter(Notice.id == notice_id).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notice not found")
    n.is_active = 0
    db.commit()
    return {"message": "Notice deleted"}
''')

w("app/routers/leaves.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.leave import Leave, LeaveStatus
from app.models.user import User
from app.schemas.leave import LeaveCreate, LeaveReview
from app.utils.auth_deps import get_current_user, require_teacher_or_admin, require_student

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])


@router.post("", status_code=201)
def apply_leave(data: LeaveCreate, current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    leave = Leave(student_id=current_user.id, reason=data.reason,
                  from_date=data.from_date, to_date=data.to_date)
    db.add(leave)
    db.commit()
    return {"message": "Leave application submitted"}


@router.get("/my")
def my_leaves(current_user: User = Depends(require_student), db: Session = Depends(get_db)):
    leaves = db.query(Leave).filter(Leave.student_id == current_user.id).all()
    return {"leaves": [{"id": l.id, "reason": l.reason, "from_date": l.from_date,
                         "to_date": l.to_date, "status": l.status.value,
                         "applied_at": l.applied_at} for l in leaves]}


@router.get("")
def all_leaves(_=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    leaves = db.query(Leave).order_by(Leave.applied_at.desc()).all()
    return {"leaves": [{"id": l.id, "student_id": l.student_id, "reason": l.reason,
                         "from_date": l.from_date, "to_date": l.to_date,
                         "status": l.status.value, "applied_at": l.applied_at} for l in leaves]}


@router.put("/{leave_id}/review")
def review_leave(
    leave_id: int, data: LeaveReview,
    current_user: User = Depends(require_teacher_or_admin),
    db: Session = Depends(get_db),
):
    leave = db.query(Leave).filter(Leave.id == leave_id).first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    leave.status = LeaveStatus(data.status)
    leave.reviewed_by_id = current_user.id
    leave.review_remarks = data.review_remarks
    db.commit()
    return {"message": f"Leave {data.status}"}
''')

w("app/routers/timetable.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.timetable import Timetable
from app.models.user import User
from app.schemas.timetable import TimetableCreate
from app.utils.auth_deps import get_current_user, require_admin

router = APIRouter(prefix="/api/timetable", tags=["Timetable"])


@router.get("")
def get_timetable(
    class_name: Optional[str] = None, section: Optional[str] = None,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    q = db.query(Timetable)
    if class_name:
        q = q.filter(Timetable.class_name == class_name)
    if section:
        q = q.filter(Timetable.section == section)
    entries = q.order_by(Timetable.day_of_week, Timetable.start_time).all()
    return {"timetable": [
        {"id": t.id, "class_name": t.class_name, "section": t.section,
         "subject_id": t.subject_id, "teacher_id": t.teacher_id,
         "day_of_week": t.day_of_week, "start_time": str(t.start_time),
         "end_time": str(t.end_time), "room": t.room} for t in entries]}


@router.post("", status_code=201)
def create_timetable(data: TimetableCreate, _=Depends(require_admin), db: Session = Depends(get_db)):
    entry = Timetable(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Timetable entry added", "id": entry.id}


@router.delete("/{entry_id}")
def delete_timetable(entry_id: int, _=Depends(require_admin), db: Session = Depends(get_db)):
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Timetable entry deleted"}
''')

w("app/routers/notifications.py", '''from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.notification import Notification
from app.models.user import User
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("")
def my_notifications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    notifs = (db.query(Notification)
              .filter(Notification.user_id == current_user.id)
              .order_by(Notification.created_at.desc()).limit(50).all())
    unread = sum(1 for n in notifs if not n.is_read)
    return {"unread": unread, "notifications": [
        {"id": n.id, "title": n.title, "message": n.message,
         "type": n.notification_type, "is_read": n.is_read, "created_at": n.created_at}
        for n in notifs]}


@router.put("/{notif_id}/read")
def mark_read(notif_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    n = db.query(Notification).filter(
        Notification.id == notif_id, Notification.user_id == current_user.id).first()
    if n:
        n.is_read = True
        db.commit()
    return {"message": "Marked as read"}


@router.put("/read-all")
def mark_all_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(Notification).filter(
        Notification.user_id == current_user.id, Notification.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"message": "All notifications marked as read"}
''')

w("app/routers/analytics.py", '''from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models.user import User, UserRole
from app.models.attendance import Attendance
from app.models.exam import Mark
from app.models.fee import Fee
from app.models.assignment import Assignment, Submission
from app.utils.auth_deps import require_admin, require_teacher_or_admin

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard")
def admin_dashboard(_=Depends(require_admin), db: Session = Depends(get_db)):
    total_students = db.query(User).filter(User.role == UserRole.student, User.is_active == True).count()
    total_teachers = db.query(User).filter(User.role == UserRole.teacher, User.is_active == True).count()
    total_assignments = db.query(Assignment).filter(Assignment.is_active == True).count()
    all_att = db.query(Attendance).all()
    present_count = sum(1 for a in all_att if a.status.value == "present")
    att_pct = round((present_count / len(all_att)) * 100, 2) if all_att else 0
    all_fees = db.query(Fee).all()
    total_fee = sum(f.amount for f in all_fees)
    paid_fee = sum(f.amount for f in all_fees if f.status.value == "paid")
    marks = db.query(Mark).all()
    grade_dist = {}
    for m in marks:
        g = m.grade or "N/A"
        grade_dist[g] = grade_dist.get(g, 0) + 1
    return {
        "total_students": total_students, "total_teachers": total_teachers,
        "total_assignments": total_assignments,
        "attendance_percentage": att_pct,
        "total_fee_amount": total_fee, "paid_fee_amount": paid_fee,
        "pending_fee_amount": total_fee - paid_fee,
        "grade_distribution": grade_dist,
    }


@router.get("/attendance-trend")
def attendance_trend(_=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    results = (db.query(Attendance.date, func.count(Attendance.id).label("total"))
               .group_by(Attendance.date).order_by(Attendance.date.desc()).limit(30).all())
    return {"trend": [{"date": str(r.date), "total": r.total} for r in results]}


@router.get("/student/{student_id}")
def student_analytics(student_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    att_pct = round((present / total) * 100, 2) if total > 0 else 0
    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    avg_marks = round(sum(m.marks_obtained for m in marks) / len(marks), 2) if marks else 0
    subs = db.query(Submission).filter(Submission.student_id == student_id).all()
    return {
        "attendance_percentage": att_pct, "total_classes": total, "present": present,
        "average_marks": avg_marks, "total_submissions": len(subs),
        "graded_submissions": sum(1 for s in subs if s.status.value == "graded"),
    }
''')

w("app/routers/ai.py", '''from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.services.ai_service import predict_performance, get_ai_recommendations, chat_with_ai
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatMessage(BaseModel):
    message: str


@router.get("/performance/{student_id}")
def performance_prediction(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return predict_performance(student_id, db)


@router.get("/recommendations/{student_id}")
def ai_recommendations(
    student_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role.value == "student" and current_user.id != student_id:
        raise HTTPException(status_code=403, detail="Access denied")
    return get_ai_recommendations(student_id, db)


@router.post("/chat")
def ai_chat(msg: ChatMessage, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    response = chat_with_ai(msg.message, current_user, db)
    return {"response": response}
''')

w("app/routers/parents.py", '''from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/parents", tags=["Parents"])


@router.get("/dashboard")
def parent_dashboard(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return {"message": "Parent dashboard", "user": current_user.full_name}
''')

# ============ AI SERVICE ============
w("app/services/ai_service.py", '''from sqlalchemy.orm import Session
from app.models.attendance import Attendance
from app.models.exam import Mark
from app.models.assignment import Assignment, Submission
from app.models.user import User
from app.config import settings
from typing import Optional


def _get_student_stats(student_id: int, db: Session) -> dict:
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    att_pct = round((present / total) * 100, 2) if total > 0 else 0

    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    avg_marks = round(sum(m.marks_obtained for m in marks) / len(marks), 2) if marks else 0.0

    all_assignments = db.query(Assignment).filter(Assignment.is_active == True).count()
    submitted = db.query(Submission).filter(Submission.student_id == student_id).count()
    assign_pct = round((submitted / all_assignments) * 100, 2) if all_assignments > 0 else 0

    return {"attendance_pct": att_pct, "avg_marks": avg_marks,
            "assignment_pct": assign_pct, "total_classes": total, "present": present}


def predict_performance(student_id: int, db: Session) -> dict:
    stats = _get_student_stats(student_id, db)
    att_pct, avg_marks, assign_pct = stats["attendance_pct"], stats["avg_marks"], stats["assignment_pct"]

    risk_score = 0
    if att_pct < 60:
        risk_score += 40
    elif att_pct < 75:
        risk_score += 20
    elif att_pct < 85:
        risk_score += 10

    if avg_marks < 40:
        risk_score += 40
    elif avg_marks < 60:
        risk_score += 20
    elif avg_marks < 75:
        risk_score += 10

    if assign_pct < 50:
        risk_score += 20
    elif assign_pct < 75:
        risk_score += 10

    if risk_score >= 60:
        level, prediction = "high", "Weak"
    elif risk_score >= 30:
        level, prediction = "medium", "Average"
    elif risk_score >= 10:
        level, prediction = "low", "Good"
    else:
        level, prediction = "low", "Excellent"

    return {
        "student_id": student_id, "prediction": prediction, "risk_level": level,
        "risk_score": risk_score, "attendance_percentage": att_pct,
        "average_marks": avg_marks, "assignment_completion": assign_pct,
    }


def get_ai_recommendations(student_id: int, db: Session) -> dict:
    stats = _get_student_stats(student_id, db)
    att_pct, avg_marks, assign_pct = stats["attendance_pct"], stats["avg_marks"], stats["assignment_pct"]

    recommendations = []
    warnings = []

    if att_pct < 75:
        warnings.append(f"Your attendance is {att_pct}% - below the 75% minimum requirement.")
        recommendations.append("Attend classes regularly to avoid shortage.")
        recommendations.append("Contact your teacher if you have valid reasons for absence.")

    if avg_marks < 60:
        warnings.append(f"Your average marks are {avg_marks}% - needs improvement.")
        recommendations.append("Practice previous year papers.")
        recommendations.append("Revise weak subjects daily.")
        recommendations.append("Attend doubt-clearing sessions.")

    if assign_pct < 75:
        warnings.append(f"Only {assign_pct}% assignments submitted.")
        recommendations.append("Complete and submit pending assignments on time.")

    if not warnings:
        recommendations.append("Keep up the excellent work!")
        recommendations.append("Consider helping peers who may be struggling.")

    gemini_suggestion = _get_gemini_insight(att_pct, avg_marks, assign_pct)
    if gemini_suggestion:
        recommendations.append(gemini_suggestion)

    return {
        "student_id": student_id, "warnings": warnings,
        "recommendations": recommendations,
        "attendance_percentage": att_pct, "average_marks": avg_marks,
        "assignment_completion": assign_pct,
    }


def chat_with_ai(message: str, user: User, db: Session) -> str:
    context = _build_student_context(user, db)
    gemini_response = _query_gemini(message, context)
    if gemini_response:
        return gemini_response
    return _rule_based_chat(message, user, db)


def _build_student_context(user: User, db: Session) -> str:
    if user.role.value != "student":
        return f"User: {user.full_name}, Role: {user.role.value}"
    stats = _get_student_stats(user.id, db)
    return (
        f"Student: {user.full_name}\\n"
        f"Attendance: {stats[\'attendance_pct\']}%\\n"
        f"Average Marks: {stats[\'avg_marks\']}%\\n"
        f"Assignment Completion: {stats[\'assignment_pct\']}%\\n"
    )


def _query_gemini(message: str, context: str) -> Optional[str]:
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"You are an AI assistant for a Student Management System.\\n"
            f"Student context:\\n{context}\\n\\n"
            f"Student asks: {message}\\n\\n"
            f"Provide a helpful, concise response (2-3 sentences max)."
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return None


def _get_gemini_insight(att_pct: float, avg_marks: float, assign_pct: float) -> Optional[str]:
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Student: attendance {att_pct}%, avg marks {avg_marks}%, "
            f"assignment completion {assign_pct}%. "
            f"Give ONE specific, actionable study tip in 1 sentence."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return None


def _rule_based_chat(message: str, user: User, db: Session) -> str:
    msg = message.lower()
    if any(w in msg for w in ["attendance", "present", "absent"]):
        if user.role.value == "student":
            records = db.query(Attendance).filter(Attendance.student_id == user.id).all()
            total = len(records)
            present = sum(1 for r in records if r.status.value in ("present", "late"))
            pct = round((present / total) * 100, 2) if total > 0 else 0
            return f"Your attendance is {pct}% ({present}/{total} classes attended)."
        return "Please log in as a student to see attendance."

    if any(w in msg for w in ["marks", "score", "grade", "result"]):
        if user.role.value == "student":
            marks = db.query(Mark).filter(Mark.student_id == user.id).all()
            if not marks:
                return "No marks recorded yet."
            avg = round(sum(m.marks_obtained for m in marks) / len(marks), 2)
            return f"You have {len(marks)} exam result(s). Your average score is {avg}%."
        return "Please log in as a student to see marks."

    if any(w in msg for w in ["assignment", "homework"]):
        if user.role.value == "student":
            total = db.query(Assignment).filter(Assignment.is_active == True).count()
            submitted = db.query(Submission).filter(Submission.student_id == user.id).count()
            return f"There are {total} active assignments. You have submitted {submitted}."
        return "Assignment info is available in the Assignments section."

    if any(w in msg for w in ["fee", "payment", "dues"]):
        if user.role.value == "student":
            from app.models.fee import Fee
            fees = db.query(Fee).filter(Fee.student_id == user.id).all()
            pending = sum(f.amount for f in fees if f.status.value != "paid")
            return f"You have pending fees of Rs {pending:.0f}."
        return "Fee information is in the Fees section."

    return (
        "I can help with attendance, marks, assignments, fees, and study tips. "
        "What would you like to know?"
    )
''')

# ============ SERVICES ============
w("app/services/email_service.py", '''from app.config import settings


async def send_email(to: str, subject: str, body: str):
    if not settings.smtp_username:
        print(f"[Email skipped] To: {to}, Subject: {subject}")
        return
    try:
        import aiosmtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        msg = MIMEMultipart("alternative")
        msg["From"] = settings.smtp_from
        msg["To"] = to
        msg["Subject"] = subject
        msg.attach(MIMEText(body, "html"))
        await aiosmtplib.send(
            msg, hostname=settings.smtp_host, port=settings.smtp_port,
            username=settings.smtp_username, password=settings.smtp_password, start_tls=True)
    except Exception as exc:
        print(f"Email send failed: {exc}")


async def send_password_reset_email(email: str, token: str):
    link = f"{settings.frontend_url}/reset-password?token={token}"
    body = f"<p>Click <a href=\'{link}\'>here</a> to reset your password. Expires in 1 hour.</p>"
    await send_email(email, "Password Reset Request", body)
''')

w("app/services/pdf_service.py", '''from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Table, TableStyle, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from io import BytesIO
from datetime import datetime


def generate_report_card(student_data: dict, marks_data: list) -> bytes:
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = []
    elements.append(Paragraph("STUDENT REPORT CARD", styles["Title"]))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Name: {student_data.get(\'full_name\', \'N/A\')}", styles["Normal"]))
    elements.append(Paragraph(f"Roll No: {student_data.get(\'roll_number\', \'N/A\')}", styles["Normal"]))
    elements.append(Paragraph(f"Generated: {datetime.now().strftime(\'%Y-%m-%d\')}", styles["Normal"]))
    elements.append(Spacer(1, 20))
    if marks_data:
        table_data = [["Subject", "Exam", "Marks", "Total", "Grade"]]
        for m in marks_data:
            table_data.append([str(m.get("subject", "N/A")), str(m.get("exam_title", "N/A")),
                                str(m.get("marks_obtained", "N/A")), str(m.get("total_marks", "N/A")),
                                str(m.get("grade", "N/A"))])
        table = Table(table_data)
        table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
            ("GRID", (0, 0), (-1, -1), 1, colors.black),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]))
        elements.append(table)
    doc.build(elements)
    return buffer.getvalue()
''')

w("app/services/notification_service.py", '''from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str,
                         notification_type: str = "general"):
    notif = Notification(user_id=user_id, title=title, message=message,
                          notification_type=notification_type)
    db.add(notif)
    db.commit()
    return notif
''')

w("app/services/scheduler.py", '''def start_scheduler():
    pass


def shutdown_scheduler():
    pass
''')

w("app/services/chatbot_service.py", "# Chatbot functionality is in ai_service.py\n")

w("app/services/__init__.py", "")

# ============ MAIN APP ============
w("app/main.py", '''from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.database import create_tables, check_connection
from app.config import settings
from app.routers import (
    auth, students, teachers, parents,
    attendance, assignments, exams, fees, leaves,
    notices, notifications, timetable, ai, analytics,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    check_connection()
    create_tables()
    for sub in ("photos", "submissions", "assignments"):
        os.makedirs(os.path.join(settings.upload_dir, sub), exist_ok=True)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Based Student Management System API",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists(settings.upload_dir):
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(parents.router)
app.include_router(attendance.router)
app.include_router(assignments.router)
app.include_router(exams.router)
app.include_router(fees.router)
app.include_router(leaves.router)
app.include_router(notices.router)
app.include_router(notifications.router)
app.include_router(timetable.router)
app.include_router(ai.router)
app.include_router(analytics.router)


@app.get("/")
def root():
    return {"name": settings.app_name, "version": settings.app_version,
            "status": "running", "docs": "/docs"}


@app.get("/health")
def health():
    return {"status": "ok"}
''')

# ============ ENV EXAMPLE ============
w(".env.example", '''# Application
APP_NAME=Student Management System
DEBUG=True
SECRET_KEY=your-super-secret-key-min-32-chars-change-this!!

# MySQL Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=student_management

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=your-email@gmail.com

# Google Gemini AI
GEMINI_API_KEY=your-gemini-api-key

# File Upload
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
''')

# ============ SEED DB ============
w("seed_db.py", '''import sys, os, random
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.teacher import TeacherProfile
from app.models.subject import Subject
from app.models.attendance import Attendance, AttendanceStatus
from app.models.exam import Exam, Mark, ExamType
from app.models.fee import Fee, FeeStatus
from app.models.notice import Notice, TargetRole
from app.utils.password_handler import hash_password
from app.utils.helpers import calculate_grade
from datetime import datetime, date, timedelta


def seed():
    create_tables()
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@school.com").first():
            db.add(User(email="admin@school.com", full_name="System Admin",
                        hashed_password=hash_password("Admin@123"),
                        role=UserRole.admin, phone="9000000000"))
            db.commit()
            print("Created admin: admin@school.com / Admin@123")

        teacher_data = [
            ("teacher1@school.com", "Dr. Priya Sharma", "T001", "Mathematics"),
            ("teacher2@school.com", "Prof. Raj Kumar", "T002", "Physics"),
            ("teacher3@school.com", "Ms. Anita Singh", "T003", "Computer Science"),
        ]
        teachers = []
        for email, name, emp_id, dept in teacher_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, full_name=name,
                         hashed_password=hash_password("Teacher@123"),
                         role=UserRole.teacher)
                db.add(u)
                db.flush()
                db.add(TeacherProfile(user_id=u.id, employee_id=emp_id, department=dept,
                                       experience_years=random.randint(5, 20)))
                db.commit()
                print(f"Created teacher: {email} / Teacher@123")
            teachers.append(u)

        subjects_list = []
        for i, (name, code, cls, sem) in enumerate([
            ("Mathematics", "MATH101", "CS-3A", 3),
            ("Physics", "PHY101", "CS-3A", 3),
            ("Computer Science", "CS101", "CS-3A", 4),
        ]):
            s = db.query(Subject).filter(Subject.code == code).first()
            if not s:
                s = Subject(name=name, code=code, class_name=cls, semester=sem,
                             teacher_id=teachers[i % len(teachers)].id if teachers else None)
                db.add(s)
                db.flush()
                db.commit()
            subjects_list.append(s)

        students = []
        for email, name, roll in [
            ("student1@school.com", "Arjun Mehta", "S001"),
            ("student2@school.com", "Priya Patel", "S002"),
            ("student3@school.com", "Rahul Singh", "S003"),
            ("student4@school.com", "Kavya Nair", "S004"),
            ("student5@school.com", "Vikram Rao", "S005"),
        ]:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, full_name=name,
                         hashed_password=hash_password("Student@123"),
                         role=UserRole.student)
                db.add(u)
                db.flush()
                db.add(StudentProfile(user_id=u.id, roll_number=roll,
                                      department="Computer Science", class_name="CS-3A",
                                      section="A", semester=3, year=2))
                db.commit()
                print(f"Created student: {email} / Student@123")
            students.append(u)

        for student in students:
            for i in range(30):
                att_date = date.today() - timedelta(days=i)
                for subject in subjects_list[:2]:
                    if not db.query(Attendance).filter(
                        Attendance.student_id == student.id,
                        Attendance.date == att_date,
                        Attendance.subject_id == subject.id
                    ).first():
                        status = random.choices(
                            [AttendanceStatus.present, AttendanceStatus.absent],
                            weights=[80, 20])[0]
                        db.add(Attendance(student_id=student.id, subject_id=subject.id,
                                          date=att_date, status=status,
                                          marked_by_id=teachers[0].id if teachers else None))
        db.commit()

        for subject in subjects_list[:2]:
            for etype in [ExamType.midterm, ExamType.final]:
                title = f"{subject.name} {etype.value.title()}"
                if not db.query(Exam).filter(Exam.title == title, Exam.subject_id == subject.id).first():
                    exam = Exam(title=title, subject_id=subject.id,
                                exam_date=datetime.now() - timedelta(days=random.randint(10, 60)),
                                exam_type=etype, total_marks=100.0, class_name="CS-3A")
                    db.add(exam)
                    db.flush()
                    for student in students:
                        mv = random.uniform(35, 98)
                        db.add(Mark(student_id=student.id, exam_id=exam.id,
                                    marks_obtained=round(mv, 2),
                                    grade=calculate_grade(mv, 100)))
                    db.commit()

        for student in students:
            for ftype, amt in [("Tuition", 5000), ("Library", 1000), ("Lab", 1500)]:
                if not db.query(Fee).filter(Fee.student_id == student.id, Fee.fee_type == ftype).first():
                    is_paid = random.choice([True, False])
                    db.add(Fee(student_id=student.id, amount=amt, fee_type=ftype,
                               due_date=datetime.now() + timedelta(days=30),
                               status=FeeStatus.paid if is_paid else FeeStatus.unpaid,
                               payment_date=datetime.now() if is_paid else None))
        db.commit()

        for title, desc in [
            ("Semester Exam Schedule", "Mid-semester exams start next Monday."),
            ("Holiday Notice", "School closed on National Holiday."),
            ("Assignment Reminder", "Assignment deadline is this Friday."),
        ]:
            if not db.query(Notice).filter(Notice.title == title).first():
                db.add(Notice(title=title, description=desc, target_role=TargetRole.all))
        db.commit()

        print("\\nDatabase seeded!")
        print("  Admin:   admin@school.com / Admin@123")
        print("  Teacher: teacher1@school.com / Teacher@123")
        print("  Student: student1@school.com / Student@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
''')

print("\nAll backend files written successfully!")
