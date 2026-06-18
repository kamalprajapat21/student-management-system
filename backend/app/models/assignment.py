from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AssignmentStatus(str, Enum):
    pending = "pending"
    submitted = "submitted"
    late = "late"
    graded = "graded"


class AssignmentCreate(BaseModel):
    title: str
    description: str
    subject: str
    class_id: str
    due_date: str  # ISO datetime string
    total_marks: float = 100
    attachments: Optional[List[str]] = []


class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[str] = None
    total_marks: Optional[float] = None


class SubmissionCreate(BaseModel):
    assignment_id: str
    student_id: str
    content: Optional[str] = None
    attachments: Optional[List[str]] = []


class GradeSubmission(BaseModel):
    submission_id: str
    marks_obtained: float
    feedback: Optional[str] = None


class AssignmentResponse(BaseModel):
    id: str
    title: str
    description: str
    subject: str
    class_id: str
    teacher_id: str
    due_date: str
    total_marks: float
    created_at: str
    submission_status: Optional[str] = None  # for student context
