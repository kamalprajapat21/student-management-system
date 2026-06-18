from fastapi import APIRouter, HTTPException, Depends, Query
from app.utils.auth_deps import get_current_user, require_admin, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list, paginate, calculate_attendance_percentage, get_attendance_status
from app.models.attendance import AttendanceRecord, BulkAttendanceRecord
from app.database import get_db
from app.services.notification_service import create_notification, send_bulk_notifications
from bson import ObjectId
from datetime import datetime, date

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


@router.post("/mark")
async def mark_attendance(data: AttendanceRecord, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    existing = await db.attendance.find_one({
        "student_id": data.student_id,
        "date": data.date,
        "subject": data.subject
    })
    if existing:
        await db.attendance.update_one(
            {"_id": existing["_id"]},
            {"$set": {"status": data.status, "updated_at": datetime.utcnow()}}
        )
        return {"message": "Attendance updated"}

    doc = {
        **data.model_dump(),
        "marked_by": str(current_user["_id"]),
        "created_at": datetime.utcnow()
    }
    await db.attendance.insert_one(doc)

    # Check attendance percentage and alert if below 75%
    await check_and_alert_attendance(data.student_id)
    return {"message": "Attendance marked successfully"}


@router.post("/mark/bulk")
async def mark_bulk_attendance(data: BulkAttendanceRecord, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    docs = []
    for record in data.records:
        existing = await db.attendance.find_one({
            "student_id": record["student_id"],
            "date": data.date,
            "subject": data.subject
        })
        if existing:
            await db.attendance.update_one(
                {"_id": existing["_id"]},
                {"$set": {"status": record["status"], "updated_at": datetime.utcnow()}}
            )
        else:
            docs.append({
                "student_id": record["student_id"],
                "date": data.date,
                "subject": data.subject,
                "class_id": data.class_id,
                "status": record["status"],
                "remarks": record.get("remarks"),
                "marked_by": str(current_user["_id"]),
                "created_at": datetime.utcnow()
            })
    if docs:
        await db.attendance.insert_many(docs)

    # Check alerts for all students
    for record in data.records:
        await check_and_alert_attendance(record["student_id"])

    return {"message": f"Attendance marked for {len(data.records)} students"}


@router.get("/student/{student_id}")
async def get_student_attendance(
    student_id: str,
    subject: str = None,
    start_date: str = None,
    end_date: str = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {"student_id": student_id}
    if subject:
        query["subject"] = subject
    if start_date:
        query["date"] = {"$gte": start_date}
    if end_date:
        query.setdefault("date", {})["$lte"] = end_date

    records = await db.attendance.find(query).sort("date", -1).to_list(500)
    total = len(records)
    present = sum(1 for r in records if r["status"] == "present")
    late = sum(1 for r in records if r["status"] == "late")
    absent = total - present - late
    percentage = calculate_attendance_percentage(present + late, total)

    return {
        "records": serialize_list(records),
        "summary": {
            "total": total,
            "present": present,
            "late": late,
            "absent": absent,
            "percentage": percentage,
            "status": get_attendance_status(percentage)
        }
    }


@router.get("/class/{class_id}")
async def get_class_attendance(
    class_id: str,
    date: str = None,
    subject: str = None,
    current_user=Depends(require_teacher_or_admin)
):
    db = get_db()
    query = {"class_id": class_id}
    if date:
        query["date"] = date
    if subject:
        query["subject"] = subject
    records = await db.attendance.find(query).to_list(500)
    return serialize_list(records)


@router.get("/subject-wise/{student_id}")
async def get_subject_wise_attendance(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    pipeline = [
        {"$match": {"student_id": student_id}},
        {"$group": {
            "_id": "$subject",
            "total": {"$sum": 1},
            "present": {"$sum": {"$cond": [{"$in": ["$status", ["present", "late"]]}, 1, 0]}}
        }},
        {"$project": {
            "subject": "$_id",
            "total": 1,
            "present": 1,
            "percentage": {"$round": [{"$multiply": [{"$divide": ["$present", "$total"]}, 100]}, 2]}
        }}
    ]
    result = await db.attendance.aggregate(pipeline).to_list(50)
    return result


async def check_and_alert_attendance(student_id: str):
    db = get_db()
    records = await db.attendance.find({"student_id": student_id}).to_list(1000)
    if not records:
        return
    total = len(records)
    present = sum(1 for r in records if r["status"] in ["present", "late"])
    percentage = calculate_attendance_percentage(present, total)

    if percentage < 75:
        student = await db.users.find_one({"_id": ObjectId(student_id)})
        if not student:
            return
        msg = f"Your attendance is {percentage}%. It has fallen below the required 75%. Please attend classes regularly."
        await create_notification(
            user_id=student_id,
            title="Low Attendance Alert",
            message=msg,
            notification_type="attendance_alert",
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
        # Alert parent
        parent = await db.users.find_one({"student_id": student_id, "role": "parent"})
        if parent:
            await create_notification(
                user_id=str(parent["_id"]),
                title="Child's Low Attendance Alert",
                message=f"Your child {student['full_name']}'s attendance is {percentage}%.",
                notification_type="attendance_alert",
                send_email=True,
                email=parent.get("email"),
                name=parent.get("full_name")
            )
