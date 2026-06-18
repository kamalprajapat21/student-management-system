from pydantic import BaseModel
from typing import Optional, List


class TimetableSlot(BaseModel):
    day: str  # Monday, Tuesday, etc.
    start_time: str
    end_time: str
    subject: str
    teacher_id: str
    teacher_name: str
    room: Optional[str] = None


class TimetableCreate(BaseModel):
    class_id: str
    department: str
    semester: int
    academic_year: str
    slots: List[TimetableSlot]


class TimetableResponse(BaseModel):
    id: str
    class_id: str
    department: str
    semester: int
    academic_year: str
    slots: List[dict]
    created_at: str
