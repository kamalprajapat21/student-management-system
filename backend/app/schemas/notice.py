from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoticeCreate(BaseModel):
    title: str
    description: str
    target_role: str = "all"


class NoticeOut(BaseModel):
    id: int
    title: str
    description: str
    created_by_id: Optional[int]
    created_at: datetime
    target_role: str
    is_active: int

    class Config:
        from_attributes = True
