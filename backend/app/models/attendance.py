from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from enum import Enum


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class AttendanceRecord(BaseModel):
    student_id: str
    date: str  # ISO date string
    status: AttendanceStatus
    subject: str
    marked_by: str  # teacher_id
    class_id: str
    remarks: Optional[str] = None


class BulkAttendanceRecord(BaseModel):
    date: str
    subject: str
    class_id: str
    marked_by: str
    records: List[dict]  # [{student_id, status, remarks}]


class AttendanceFilter(BaseModel):
    student_id: Optional[str] = None
    class_id: Optional[str] = None
    subject: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    status: Optional[AttendanceStatus] = None


class AttendanceSummary(BaseModel):
    student_id: str
    total_classes: int
    present: int
    absent: int
    late: int
    percentage: float
    status: str  # Safe / Warning / Critical
