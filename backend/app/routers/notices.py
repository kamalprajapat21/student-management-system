from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.notice import NoticeCreate, NoticePriority
from app.database import get_db
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/notices", tags=["Notices"])


@router.post("/")
async def create_notice(data: NoticeCreate, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "created_by": str(current_user["_id"]),
        "created_by_name": current_user["full_name"],
        "created_by_role": current_user["role"],
        "created_at": datetime.utcnow(),
        "is_active": True
    }
    result = await db.notices.insert_one(doc)

    # Notify relevant users
    query = {"is_active": True}
    if data.target == "students":
        query["role"] = "student"
    elif data.target == "teachers":
        query["role"] = "teacher"
    elif data.target == "class_specific" and data.target_class:
        query["class_name"] = data.target_class
    elif data.target == "parents":
        query["role"] = "parent"

    users = await db.users.find(query, {"_id": 1}).to_list(500)
    for user in users:
        await create_notification(
            user_id=str(user["_id"]),
            title=f"Notice: {data.title}",
            message=data.content[:200],
            notification_type="notice_alert",
            reference_id=str(result.inserted_id),
            send_email=False
        )
    return {"message": "Notice published", "notice_id": str(result.inserted_id)}


@router.get("/")
async def get_notices(
    target: str = None,
    priority: str = None,
    page: int = 1,
    limit: int = 20,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {"is_active": True}
    if priority:
        query["priority"] = priority
    skip = (page - 1) * limit
    notices = await db.notices.find(query).sort(
        [("priority", -1), ("created_at", -1)]
    ).skip(skip).limit(limit).to_list(limit)
    total = await db.notices.count_documents(query)
    return {"notices": serialize_list(notices), "total": total}


@router.get("/{notice_id}")
async def get_notice(notice_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    notice = await db.notices.find_one({"_id": ObjectId(notice_id)})
    if not notice:
        raise HTTPException(status_code=404, detail="Notice not found")
    return serialize_doc(notice)


@router.delete("/{notice_id}")
async def delete_notice(notice_id: str, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    result = await db.notices.update_one(
        {"_id": ObjectId(notice_id), "created_by": str(current_user["_id"])},
        {"$set": {"is_active": False}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Notice not found or unauthorized")
    return {"message": "Notice deleted"}
