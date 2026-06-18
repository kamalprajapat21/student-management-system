from fastapi import APIRouter, HTTPException, Depends, Query
from app.utils.auth_deps import get_current_user, require_admin, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list, paginate
from app.database import get_db
from bson import ObjectId
from datetime import datetime

router = APIRouter(prefix="/api/teachers", tags=["Teachers"])


@router.get("/")
async def get_teachers(
    page: int = 1,
    limit: int = 20,
    department: str = None,
    search: str = None,
    current_user=Depends(require_admin)
):
    db = get_db()
    query = {"role": "teacher", "is_active": True}
    if department:
        query["department"] = department
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"employee_id": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    skip, lim = paginate(page, limit)
    teachers = await db.users.find(query, {"password": 0}).skip(skip).limit(lim).to_list(lim)
    total = await db.users.count_documents(query)
    return {"teachers": serialize_list(teachers), "total": total, "page": page, "limit": lim}


@router.get("/my-classes")
async def get_teacher_classes(current_user=Depends(get_current_user)):
    db = get_db()
    # Get unique classes from timetable where teacher is assigned
    teacher_id = str(current_user["_id"])
    timetables = await db.timetables.find({"slots.teacher_id": teacher_id}).to_list(20)
    classes = list(set(t["class_id"] for t in timetables))
    return {"classes": classes}


@router.get("/{teacher_id}/profile")
async def get_teacher_profile(teacher_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    teacher = await db.users.find_one(
        {"_id": ObjectId(teacher_id), "role": "teacher"}, {"password": 0}
    )
    if not teacher:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return serialize_doc(teacher)


@router.put("/{teacher_id}")
async def update_teacher(teacher_id: str, data: dict, current_user=Depends(require_admin)):
    db = get_db()
    allowed = ["full_name", "phone", "department", "subjects", "qualification", "experience_years", "is_active"]
    update_data = {k: v for k, v in data.items() if k in allowed}
    update_data["updated_at"] = datetime.utcnow()
    result = await db.users.update_one(
        {"_id": ObjectId(teacher_id), "role": "teacher"},
        {"$set": update_data}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher updated"}


@router.delete("/{teacher_id}")
async def delete_teacher(teacher_id: str, current_user=Depends(require_admin)):
    db = get_db()
    result = await db.users.update_one(
        {"_id": ObjectId(teacher_id), "role": "teacher"},
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Teacher not found")
    return {"message": "Teacher deactivated"}
