from app.database import get_db
from app.services.email_service import send_email
from datetime import datetime
from typing import Optional


async def create_notification(
    user_id: str,
    title: str,
    message: str,
    notification_type: str,
    reference_id: Optional[str] = None,
    send_email: bool = False,
    email: Optional[str] = None,
    name: Optional[str] = None
):
    db = get_db()
    doc = {
        "user_id": user_id,
        "title": title,
        "message": message,
        "notification_type": notification_type,
        "reference_id": reference_id,
        "is_read": False,
        "created_at": datetime.utcnow()
    }
    await db.notifications.insert_one(doc)

    if send_email and email:
        html = f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">{title}</h2>
            <p>Hello {name or 'Student'},</p>
            <p>{message}</p>
            <hr>
            <p style="color: #666; font-size: 12px;">Student Management System</p>
        </div>
        """
        await send_email(email, title, html)


async def send_bulk_notifications(
    user_ids: list,
    title: str,
    message: str,
    notification_type: str,
    reference_id: Optional[str] = None
):
    db = get_db()
    docs = [
        {
            "user_id": uid,
            "title": title,
            "message": message,
            "notification_type": notification_type,
            "reference_id": reference_id,
            "is_read": False,
            "created_at": datetime.utcnow()
        }
        for uid in user_ids
    ]
    if docs:
        await db.notifications.insert_many(docs)


async def schedule_fee_reminders():
    """Check for upcoming fee dues and send reminders."""
    from datetime import timedelta
    db = get_db()
    today = datetime.utcnow()
    # 7 days reminder
    seven_days = (today + timedelta(days=7)).strftime("%Y-%m-%d")
    # On due date
    today_str = today.strftime("%Y-%m-%d")

    upcoming_fees = await db.fees.find({
        "status": {"$in": ["pending", "partial"]},
        "due_date": {"$in": [seven_days, today_str]}
    }).to_list(500)

    for fee in upcoming_fees:
        student = await db.users.find_one({"_id": fee["student_id"]})
        if student:
            days_text = "7 days" if fee["due_date"] == seven_days else "today"
            await create_notification(
                user_id=fee["student_id"],
                title="Fee Payment Reminder",
                message=f"Your {fee['fee_type']} fee of ₹{fee['due_amount']} is due {days_text}.",
                notification_type="fee_reminder",
                reference_id=str(fee["_id"]),
                send_email=True,
                email=student.get("email"),
                name=student.get("full_name")
            )
