from fastapi import APIRouter, Depends, Query
from app.utils.auth_deps import get_current_user
from app.utils.helpers import serialize_list
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/")
async def get_notifications(
    page: int = 1,
    limit: int = 20,
    unread_only: bool = False,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {"user_id": str(current_user["_id"])}
    if unread_only:
        query["is_read"] = False
    skip = (page - 1) * limit
    notifications = await db.notifications.find(query).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    total = await db.notifications.count_documents(query)
    unread_count = await db.notifications.count_documents({"user_id": str(current_user["_id"]), "is_read": False})
    return {
        "notifications": serialize_list(notifications),
        "total": total,
        "unread_count": unread_count
    }


@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_one(
        {"_id": ObjectId(notification_id), "user_id": str(current_user["_id"])},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    return {"message": "Marked as read"}


@router.post("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_many(
        {"user_id": str(current_user["_id"]), "is_read": False},
        {"$set": {"is_read": True, "read_at": datetime.utcnow()}}
    )
    return {"message": "All notifications marked as read"}


@router.get("/unread-count")
async def get_unread_count(current_user=Depends(get_current_user)):
    db = get_db()
    count = await db.notifications.count_documents(
        {"user_id": str(current_user["_id"]), "is_read": False}
    )
    return {"unread_count": count}
