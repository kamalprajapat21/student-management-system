from fastapi import APIRouter, Depends
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
