from pydantic import BaseModel
from typing import Optional
from enum import Enum


class LeaveStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class LeaveType(str, Enum):
    sick = "sick"
    personal = "personal"
    family = "family"
    other = "other"


class LeaveCreate(BaseModel):
    leave_type: LeaveType
    start_date: str
    end_date: str
    reason: str
    contact_during_leave: Optional[str] = None
    attachment: Optional[str] = None


class LeaveAction(BaseModel):
    leave_id: str
    action: LeaveStatus  # approved or rejected
    remarks: Optional[str] = None


class LeaveResponse(BaseModel):
    id: str
    student_id: str
    student_name: str
    leave_type: str
    start_date: str
    end_date: str
    reason: str
    status: LeaveStatus
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[str] = None
    remarks: Optional[str] = None
    created_at: str
