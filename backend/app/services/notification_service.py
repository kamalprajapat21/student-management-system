from sqlalchemy.orm import Session
from app.models.notification import Notification


def create_notification(db: Session, user_id: int, title: str, message: str,
                         notification_type: str = "general"):
    notif = Notification(user_id=user_id, title=title, message=message,
                          notification_type=notification_type)
    db.add(notif)
    db.commit()
    return notif
