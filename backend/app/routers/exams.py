from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.exam import ExamCreate, MarksUpload, BulkMarksUpload, PracticalCreate
from app.database import get_db
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/exams", tags=["Exams"])


@router.post("/")
async def create_exam(data: ExamCreate, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "created_by": str(current_user["_id"]),
        "created_by_name": current_user["full_name"],
        "created_at": datetime.utcnow()
    }
    result = await db.exams.insert_one(doc)

    # Notify students
    students = await db.users.find(
        {"class_name": data.class_id, "role": "student", "is_active": True}
    ).to_list(200)
    for student in students:
        await create_notification(
            user_id=str(student["_id"]),
            title=f"Exam Scheduled: {data.title}",
            message=f"{data.exam_type.capitalize()} exam for {data.subject} scheduled on {data.exam_date} at {data.start_time}.",
            notification_type="exam_alert",
            reference_id=str(result.inserted_id),
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
    return {"message": "Exam created", "exam_id": str(result.inserted_id)}


@router.post("/practical")
async def create_practical(data: PracticalCreate, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "exam_type": "practical",
        "created_by": str(current_user["_id"]),
        "created_by_name": current_user["full_name"],
        "created_at": datetime.utcnow()
    }
    result = await db.exams.insert_one(doc)

    students = await db.users.find(
        {"class_name": data.class_id, "role": "student", "is_active": True}
    ).to_list(200)
    for student in students:
        await create_notification(
            user_id=str(student["_id"]),
            title=f"Practical Scheduled: {data.title}",
            message=f"Practical exam for {data.subject} scheduled on {data.practical_date} at {data.start_time}.",
            notification_type="practical_alert",
            reference_id=str(result.inserted_id),
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
    return {"message": "Practical created", "practical_id": str(result.inserted_id)}


@router.get("/")
async def get_exams(
    class_id: str = None,
    exam_type: str = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {}
    if current_user["role"] == "student":
        query["class_id"] = current_user.get("class_name")
    if class_id:
        query["class_id"] = class_id
    if exam_type:
        query["exam_type"] = exam_type
    exams = await db.exams.find(query).sort("exam_date", 1).to_list(100)
    return serialize_list(exams)


@router.get("/upcoming")
async def get_upcoming_exams(current_user=Depends(get_current_user)):
    db = get_db()
    today = datetime.utcnow().strftime("%Y-%m-%d")
    query = {"exam_date": {"$gte": today}}
    if current_user["role"] == "student":
        query["class_id"] = current_user.get("class_name")
    exams = await db.exams.find(query).sort("exam_date", 1).limit(10).to_list(10)
    return serialize_list(exams)


@router.post("/marks/upload")
async def upload_marks(data: MarksUpload, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    existing = await db.marks.find_one({"exam_id": data.exam_id, "student_id": data.student_id})
    if existing:
        await db.marks.update_one(
            {"_id": existing["_id"]},
            {"$set": {"marks_obtained": data.marks_obtained, "remarks": data.remarks, "updated_at": datetime.utcnow()}}
        )
    else:
        await db.marks.insert_one({
            **data.model_dump(),
            "uploaded_by": str(current_user["_id"]),
            "created_at": datetime.utcnow()
        })

    student = await db.users.find_one({"_id": ObjectId(data.student_id)})
    if student:
        exam = await db.exams.find_one({"_id": ObjectId(data.exam_id)})
        await create_notification(
            user_id=data.student_id,
            title="Marks Updated",
            message=f"Your marks for {exam['subject'] if exam else 'exam'} have been uploaded: {data.marks_obtained}",
            notification_type="marks_uploaded",
            send_email=False
        )
    return {"message": "Marks uploaded"}


@router.post("/marks/bulk")
async def bulk_upload_marks(data: BulkMarksUpload, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    for record in data.marks:
        await db.marks.update_one(
            {"exam_id": data.exam_id, "student_id": record["student_id"]},
            {"$set": {
                "marks_obtained": record["marks_obtained"],
                "remarks": record.get("remarks"),
                "uploaded_by": str(current_user["_id"]),
                "updated_at": datetime.utcnow()
            }},
            upsert=True
        )
    return {"message": f"Marks uploaded for {len(data.marks)} students"}


@router.get("/marks/student/{student_id}")
async def get_student_marks(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    marks = await db.marks.find({"student_id": student_id}).to_list(100)
    result = []
    for m in marks:
        exam = await db.exams.find_one({"_id": ObjectId(m["exam_id"])})
        if exam:
            m["exam_details"] = serialize_doc(exam)
        result.append(serialize_doc(m))
    return result
