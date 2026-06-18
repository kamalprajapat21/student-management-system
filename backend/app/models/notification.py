from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class NotificationType(str, Enum):
    attendance_alert = "attendance_alert"
    fee_reminder = "fee_reminder"
    assignment_reminder = "assignment_reminder"
    practical_alert = "practical_alert"
    exam_alert = "exam_alert"
    notice_alert = "notice_alert"
    leave_update = "leave_update"
    marks_uploaded = "marks_uploaded"
    general = "general"


class NotificationCreate(BaseModel):
    user_id: str
    title: str
    message: str
    notification_type: NotificationType
    reference_id: Optional[str] = None  # ID of related document
    send_email: bool = False


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    title: str
    message: str
    notification_type: str
    is_read: bool
    created_at: str
    reference_id: Optional[str] = None
