from pydantic import BaseModel
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
