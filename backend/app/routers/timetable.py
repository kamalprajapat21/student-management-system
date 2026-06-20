from fastapi import APIRouter, Depends, HTTPException
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
