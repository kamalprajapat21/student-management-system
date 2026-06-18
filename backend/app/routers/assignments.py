from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.assignment import AssignmentCreate, AssignmentUpdate, GradeSubmission
from app.database import get_db
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime
import os, aiofiles

router = APIRouter(prefix="/api/assignments", tags=["Assignments"])


@router.post("/")
async def create_assignment(data: AssignmentCreate, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "teacher_id": str(current_user["_id"]),
        "teacher_name": current_user["full_name"],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = await db.assignments.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Notify all students in class
    students = await db.users.find(
        {"class_name": data.class_id, "role": "student", "is_active": True}
    ).to_list(200)
    for student in students:
        await create_notification(
            user_id=str(student["_id"]),
            title=f"New Assignment: {data.title}",
            message=f"A new assignment '{data.title}' for {data.subject} has been uploaded. Due: {data.due_date}",
            notification_type="assignment_reminder",
            reference_id=str(result.inserted_id),
            send_email=False
        )
    return {"message": "Assignment created", "assignment": serialize_doc(doc)}


@router.get("/")
async def get_assignments(
    class_id: str = None,
    subject: str = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {}
    if current_user["role"] == "teacher":
        query["teacher_id"] = str(current_user["_id"])
    elif current_user["role"] == "student":
        query["class_id"] = current_user.get("class_name")
    if class_id:
        query["class_id"] = class_id
    if subject:
        query["subject"] = subject

    assignments = await db.assignments.find(query).sort("created_at", -1).to_list(100)

    # For students, attach submission status
    if current_user["role"] == "student":
        student_id = str(current_user["_id"])
        for a in assignments:
            sub = await db.submissions.find_one({
                "assignment_id": str(a["_id"]),
                "student_id": student_id
            })
            a["submission_status"] = sub["status"] if sub else "not_submitted"
            a["submission"] = serialize_doc(sub) if sub else None

    return serialize_list(assignments)


@router.get("/{assignment_id}")
async def get_assignment(assignment_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return serialize_doc(assignment)


@router.put("/{assignment_id}")
async def update_assignment(
    assignment_id: str,
    data: AssignmentUpdate,
    current_user=Depends(require_teacher_or_admin)
):
    db = get_db()
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    update["updated_at"] = datetime.utcnow()
    result = await db.assignments.update_one(
        {"_id": ObjectId(assignment_id), "teacher_id": str(current_user["_id"])},
        {"$set": update}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Assignment not found or unauthorized")
    return {"message": "Assignment updated"}


@router.post("/submit/{assignment_id}")
async def submit_assignment(
    assignment_id: str,
    content: str = None,
    file: UploadFile = File(None),
    current_user=Depends(get_current_user)
):
    db = get_db()
    assignment = await db.assignments.find_one({"_id": ObjectId(assignment_id)})
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    existing = await db.submissions.find_one({
        "assignment_id": assignment_id,
        "student_id": str(current_user["_id"])
    })

    now = datetime.utcnow()
    due = datetime.fromisoformat(assignment["due_date"])
    submission_status = "late" if now > due else "submitted"

    attachments = []
    if file:
        from app.config import settings
        upload_dir = os.path.join(settings.upload_dir, "submissions")
        os.makedirs(upload_dir, exist_ok=True)
        filename = f"{assignment_id}_{current_user['_id']}_{now.timestamp()}{os.path.splitext(file.filename)[1]}"
        filepath = os.path.join(upload_dir, filename)
        async with aiofiles.open(filepath, "wb") as f:
            await f.write(await file.read())
        attachments.append(f"/uploads/submissions/{filename}")

    if existing:
        await db.submissions.update_one(
            {"_id": existing["_id"]},
            {"$set": {"content": content, "attachments": attachments, "status": submission_status, "submitted_at": now}}
        )
    else:
        await db.submissions.insert_one({
            "assignment_id": assignment_id,
            "student_id": str(current_user["_id"]),
            "student_name": current_user["full_name"],
            "content": content,
            "attachments": attachments,
            "status": submission_status,
            "submitted_at": now,
            "marks_obtained": None,
            "feedback": None
        })

    return {"message": "Assignment submitted", "status": submission_status}


@router.get("/{assignment_id}/submissions")
async def get_submissions(assignment_id: str, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    submissions = await db.submissions.find({"assignment_id": assignment_id}).to_list(200)
    return serialize_list(submissions)


@router.post("/grade")
async def grade_submission(data: GradeSubmission, current_user=Depends(require_teacher_or_admin)):
    db = get_db()
    result = await db.submissions.update_one(
        {"_id": ObjectId(data.submission_id)},
        {"$set": {
            "marks_obtained": data.marks_obtained,
            "feedback": data.feedback,
            "status": "graded",
            "graded_at": datetime.utcnow(),
            "graded_by": str(current_user["_id"])
        }}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Submission not found")
    return {"message": "Submission graded"}
