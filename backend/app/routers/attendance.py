from fastapi import APIRouter, Depends
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
