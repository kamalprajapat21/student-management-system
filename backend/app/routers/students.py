from fastapi import APIRouter, HTTPException, Depends
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
