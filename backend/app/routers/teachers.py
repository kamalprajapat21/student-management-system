from fastapi import APIRouter, HTTPException, Depends
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
