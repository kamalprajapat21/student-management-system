from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user, require_teacher_or_admin, require_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.timetable import TimetableCreate
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/timetable", tags=["Timetable"])


@router.post("/")
async def create_timetable(data: TimetableCreate, current_user=Depends(require_admin)):
    db = get_db()
    await db.timetables.delete_many({
        "class_id": data.class_id,
        "academic_year": data.academic_year,
        "semester": data.semester
    })
    doc = {
        **data.model_dump(),
        "created_by": str(current_user["_id"]),
        "created_at": datetime.utcnow()
    }
    result = await db.timetables.insert_one(doc)
    doc["_id"] = result.inserted_id
    return {"message": "Timetable created", "timetable": serialize_doc(doc)}


@router.get("/class/{class_id}")
async def get_class_timetable(class_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    timetable = await db.timetables.find_one(
        {"class_id": class_id},
        sort=[("created_at", -1)]
    )
    if not timetable:
        raise HTTPException(status_code=404, detail="Timetable not found")
    return serialize_doc(timetable)


@router.get("/my")
async def get_my_timetable(current_user=Depends(get_current_user)):
    db = get_db()
    if current_user["role"] == "student":
        class_id = current_user.get("class_name")
        timetable = await db.timetables.find_one({"class_id": class_id}, sort=[("created_at", -1)])
        return serialize_doc(timetable) if timetable else {}
    elif current_user["role"] == "teacher":
        teacher_id = str(current_user["_id"])
        timetables = await db.timetables.find({
            "slots.teacher_id": teacher_id
        }).to_list(10)
        teacher_slots = []
        for t in timetables:
            for slot in t.get("slots", []):
                if slot.get("teacher_id") == teacher_id:
                    slot["class_id"] = t["class_id"]
                    teacher_slots.append(slot)
        return {"slots": teacher_slots}
    return {}
