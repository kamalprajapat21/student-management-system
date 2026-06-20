from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.attendance import Attendance
from app.models.exam import Mark, Exam
from app.models.fee import Fee, FeeStatus
from app.models.notice import Notice
from app.models.leave import Leave
from app.utils.auth_deps import get_current_user

router = APIRouter(prefix="/api/parents", tags=["Parents"])


def _get_child(parent_email: str, db: Session) -> Optional[tuple]:
    """Find the student whose parent_email matches the logged-in parent."""
    sp = db.query(StudentProfile).filter(StudentProfile.parent_email == parent_email).first()
    if not sp:
        return None, None
    child = db.query(User).filter(User.id == sp.user_id).first()
    return child, sp


@router.get("/dashboard")
def parent_dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.parent:
        raise HTTPException(status_code=403, detail="Access denied")

    child, sp = _get_child(current_user.email, db)
    if not child:
        return {
            "parent": {"id": current_user.id, "name": current_user.full_name, "email": current_user.email},
            "child": None,
            "message": "No child linked to this parent account. Contact admin.",
        }

    # Attendance
    att_records = db.query(Attendance).filter(Attendance.student_id == child.id).all()
    total_classes = len(att_records)
    present = sum(1 for r in att_records if r.status.value in ("present", "late"))
    att_pct = round((present / total_classes) * 100, 2) if total_classes > 0 else 0

    # Marks
    marks = (
        db.query(Mark, Exam)
        .join(Exam, Mark.exam_id == Exam.id)
        .filter(Mark.student_id == child.id)
        .order_by(Exam.exam_date.desc())
        .limit(10)
        .all()
    )
    marks_data = [
        {
            "exam_title": e.title,
            "exam_type": e.exam_type.value,
            "marks_obtained": m.marks_obtained,
            "total_marks": e.total_marks,
            "percentage": round((m.marks_obtained / e.total_marks) * 100, 2) if e.total_marks > 0 else 0,
            "grade": m.grade,
            "exam_date": e.exam_date,
        }
        for m, e in marks
    ]
    avg_pct = round(sum(x["percentage"] for x in marks_data) / len(marks_data), 2) if marks_data else 0

    # Fees
    fees = db.query(Fee).filter(Fee.student_id == child.id).all()
    total_fees = sum(f.amount for f in fees)
    paid_fees = sum(f.amount for f in fees if f.status == FeeStatus.paid)
    unpaid_fees = sum(f.amount for f in fees if f.status in (FeeStatus.unpaid, FeeStatus.overdue))
    fee_records = [
        {
            "id": f.id,
            "fee_type": f.fee_type,
            "amount": f.amount,
            "status": f.status.value,
            "due_date": f.due_date,
            "payment_date": f.payment_date,
        }
        for f in fees
    ]

    # Notices
    notices = (
        db.query(Notice)
        .filter(Notice.is_active == True, Notice.target_role.in_(["all", "parent", "student"]))
        .order_by(Notice.created_at.desc())
        .limit(5)
        .all()
    )
    notices_data = [
        {"id": n.id, "title": n.title, "description": n.description, "created_at": n.created_at}
        for n in notices
    ]

    # Leaves
    leave_records = db.query(Leave).filter(Leave.student_id == child.id).order_by(Leave.applied_at.desc()).limit(5).all()
    leaves_data = [
        {
            "id": lv.id,
            "reason": lv.reason,
            "from_date": lv.from_date,
            "to_date": lv.to_date,
            "status": lv.status.value,
            "applied_at": lv.applied_at,
        }
        for lv in leave_records
    ]

    return {
        "parent": {"id": current_user.id, "name": current_user.full_name, "email": current_user.email},
        "child": {
            "id": child.id,
            "name": child.full_name,
            "email": child.email,
            "roll_number": sp.roll_number,
            "class_name": sp.class_name,
            "section": sp.section,
            "department": sp.department,
            "semester": sp.semester,
            "year": sp.year,
        },
        "attendance": {
            "total_classes": total_classes,
            "present": present,
            "absent": total_classes - present,
            "percentage": att_pct,
        },
        "marks": {"average_percentage": avg_pct, "records": marks_data},
        "fees": {
            "total": total_fees,
            "paid": paid_fees,
            "unpaid": unpaid_fees,
            "records": fee_records,
        },
        "notices": notices_data,
        "leaves": leaves_data,
    }


@router.get("/child/attendance")
def child_attendance(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.parent:
        raise HTTPException(status_code=403, detail="Access denied")
    child, _ = _get_child(current_user.email, db)
    if not child:
        raise HTTPException(status_code=404, detail="No child linked")
    records = db.query(Attendance).filter(Attendance.student_id == child.id).order_by(Attendance.date.desc()).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    return {
        "percentage": round((present / total) * 100, 2) if total > 0 else 0,
        "total": total,
        "present": present,
        "absent": total - present,
        "records": [
            {"id": r.id, "date": r.date, "status": r.status.value, "subject_id": r.subject_id}
            for r in records
        ],
    }


@router.get("/child/marks")
def child_marks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role != UserRole.parent:
        raise HTTPException(status_code=403, detail="Access denied")
    child, _ = _get_child(current_user.email, db)
    if not child:
        raise HTTPException(status_code=404, detail="No child linked")
    marks = (
        db.query(Mark, Exam)
        .join(Exam, Mark.exam_id == Exam.id)
        .filter(Mark.student_id == child.id)
        .order_by(Exam.exam_date.desc())
        .all()
    )
    return {
        "marks": [
            {
                "id": m.id,
                "exam_title": e.title,
                "exam_type": e.exam_type.value,
                "marks_obtained": m.marks_obtained,
                "total_marks": e.total_marks,
                "percentage": round((m.marks_obtained / e.total_marks) * 100, 2) if e.total_marks > 0 else 0,
                "grade": m.grade,
                "exam_date": e.exam_date,
            }
            for m, e in marks
        ]
    }

