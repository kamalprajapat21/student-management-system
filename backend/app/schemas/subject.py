from pydantic import BaseModel
from typing import Optional


class SubjectCreate(BaseModel):
    name: str
    code: str
    teacher_id: Optional[int] = None
    class_name: Optional[str] = None
    section: Optional[str] = None
    semester: Optional[int] = None
    credits: int = 3


class SubjectOut(BaseModel):
    id: int
    name: str
    code: str
    teacher_id: Optional[int]
    class_name: Optional[str]
    section: Optional[str]
    semester: Optional[int]
    credits: int

    class Config:
        from_attributes = True
