from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ExamType(str, Enum):
    midterm = "midterm"
    final = "final"
    practical = "practical"
    quiz = "quiz"
    internal = "internal"


class ExamCreate(BaseModel):
    title: str
    exam_type: ExamType
    subject: str
    class_id: str
    department: str
    exam_date: str
    start_time: str
    end_time: str
    total_marks: float
    venue: Optional[str] = None
    instructions: Optional[str] = None


class MarksUpload(BaseModel):
    exam_id: str
    student_id: str
    marks_obtained: float
    remarks: Optional[str] = None


class BulkMarksUpload(BaseModel):
    exam_id: str
    marks: List[dict]  # [{student_id, marks_obtained, remarks}]


class PracticalCreate(BaseModel):
    title: str
    subject: str
    class_id: str
    department: str
    practical_date: str
    start_time: str
    end_time: str
    total_marks: float
    venue: Optional[str] = None
    instructions: Optional[str] = None
    batch: Optional[str] = None


class ExamResponse(BaseModel):
    id: str
    title: str
    exam_type: str
    subject: str
    class_id: str
    exam_date: str
    start_time: str
    end_time: str
    total_marks: float
    venue: Optional[str]
    created_by: str
