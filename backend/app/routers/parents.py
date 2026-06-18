from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user, require_parent
from app.utils.helpers import serialize_doc, serialize_list
from app.database import get_db
from bson import ObjectId

router = APIRouter(prefix="/api/parents", tags=["Parents"])


@router.get("/child/info")
async def get_child_info(current_user=Depends(require_parent)):
    db = get_db()
    student_id = current_user.get("student_id")
    if not student_id:
        raise HTTPException(status_code=404, detail="No student linked to this parent account")
    student = await db.users.find_one({"_id": ObjectId(student_id)}, {"password": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_doc(student)


@router.get("/child/attendance")
async def get_child_attendance(current_user=Depends(require_parent)):
    db = get_db()
    student_id = current_user.get("student_id")
    records = await db.attendance.find({"student_id": student_id}).sort("date", -1).to_list(500)
    total = len(records)
    present = sum(1 for r in records if r["status"] in ["present", "late"])
    pct = round(present / total * 100, 2) if total else 0
    return {
        "records": serialize_list(records[-30:]),  # Last 30 records
        "summary": {
            "total": total,
            "present": present,
            "absent": total - present,
            "percentage": pct,
            "status": "Safe" if pct >= 75 else "Warning" if pct >= 60 else "Critical"
        }
    }


@router.get("/child/fees")
async def get_child_fees(current_user=Depends(require_parent)):
    db = get_db()
    student_id = current_user.get("student_id")
    fees = await db.fees.find({"student_id": student_id}).to_list(50)
    total_due = sum(f.get("due_amount", 0) for f in fees if f["status"] != "paid")
    return {
        "fees": serialize_list(fees),
        "total_due": total_due
    }


@router.get("/child/marks")
async def get_child_marks(current_user=Depends(require_parent)):
    db = get_db()
    student_id = current_user.get("student_id")
    marks = await db.marks.find({"student_id": student_id}).to_list(100)
    result = []
    for m in marks:
        exam = await db.exams.find_one({"_id": ObjectId(m["exam_id"])})
        if exam:
            m["exam_details"] = serialize_doc(exam)
        result.append(serialize_doc(m))
    return result


@router.get("/child/notifications")
async def get_child_notifications(current_user=Depends(require_parent)):
    db = get_db()
    # Get notifications for both parent and child
    student_id = current_user.get("student_id")
    parent_id = str(current_user["_id"])
    notifs = await db.notifications.find({
        "$or": [{"user_id": parent_id}, {"user_id": student_id}]
    }).sort("created_at", -1).limit(30).to_list(30)
    return serialize_list(notifs)
