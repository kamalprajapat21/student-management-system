from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class NoticePriority(str, Enum):
    low = "low"
    normal = "normal"
    high = "high"
    urgent = "urgent"


class NoticeTarget(str, Enum):
    all = "all"
    students = "students"
    teachers = "teachers"
    parents = "parents"
    class_specific = "class_specific"


class NoticeCreate(BaseModel):
    title: str
    content: str
    priority: NoticePriority = NoticePriority.normal
    target: NoticeTarget = NoticeTarget.all
    target_class: Optional[str] = None
    target_department: Optional[str] = None
    attachments: Optional[List[str]] = []
    expires_at: Optional[str] = None


class NoticeResponse(BaseModel):
    id: str
    title: str
    content: str
    priority: str
    target: str
    created_by: str
    created_by_name: str
    created_at: str
    attachments: List[str]
    is_read: Optional[bool] = False
