from pydantic import BaseModel
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
