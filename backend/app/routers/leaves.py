from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.leave import LeaveCreate, LeaveAction, LeaveStatus
from app.database import get_db
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/leaves", tags=["Leaves"])


@router.post("/apply")
async def apply_leave(data: LeaveCreate, current_user=Depends(get_current_user)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "student_id": str(current_user["_id"]),
        "student_name": current_user["full_name"],
        "student_roll": current_user.get("roll_number"),
        "class_id": current_user.get("class_name"),
        "status": "pending",
        "created_at": datetime.utcnow()
    }
    result = await db.leaves.insert_one(doc)
    return {"message": "Leave application submitted", "leave_id": str(result.inserted_id)}


@router.get("/my")
async def get_my_leaves(current_user=Depends(get_current_user)):
    db = get_db()
    leaves = await db.leaves.find({"student_id": str(current_user["_id"])}).sort("created_at", -1).to_list(50)
    return serialize_list(leaves)


@router.get("/pending")
async def get_pending_leaves(current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    query = {"status": "pending"}
    if current_user["role"] == "teacher":
        query["class_id"] = current_user.get("class_assigned")
    leaves = await db.leaves.find(query).sort("created_at", -1).to_list(100)
    return serialize_list(leaves)


@router.post("/action")
async def process_leave(data: LeaveAction, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    leave = await db.leaves.find_one({"_id": ObjectId(data.leave_id)})
    if not leave:
        raise HTTPException(status_code=404, detail="Leave not found")

    await db.leaves.update_one(
        {"_id": ObjectId(data.leave_id)},
        {"$set": {
            "status": data.action,
            "reviewed_by": str(current_user["_id"]),
            "reviewer_name": current_user["full_name"],
            "reviewed_at": datetime.utcnow().isoformat(),
            "remarks": data.remarks
        }}
    )

    student = await db.users.find_one({"_id": ObjectId(leave["student_id"])})
    if student:
        status_text = "approved" if data.action == "approved" else "rejected"
        await create_notification(
            user_id=leave["student_id"],
            title=f"Leave Application {status_text.capitalize()}",
            message=f"Your leave application from {leave['start_date']} to {leave['end_date']} has been {status_text}. {data.remarks or ''}",
            notification_type="leave_update",
            reference_id=data.leave_id,
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
    return {"message": f"Leave {data.action} successfully"}


@router.get("/all")
async def get_all_leaves(
    status: str = None,
    class_id: str = None,
    current_user=Depends(require_teacher_or_admin)
):
    db = get_db()
    query = {}
    if status:
        query["status"] = status
    if class_id:
        query["class_id"] = class_id
    leaves = await db.leaves.find(query).sort("created_at", -1).to_list(200)
    return serialize_list(leaves)
