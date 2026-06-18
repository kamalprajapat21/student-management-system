from fastapi import APIRouter, HTTPException, Depends, Query, UploadFile, File
from app.utils.auth_deps import get_current_user, require_admin, require_teacher_or_admin
from app.utils.helpers import serialize_doc, serialize_list, paginate
from app.database import get_db
from app.services.email_service import send_email
from bson import ObjectId
from datetime import datetime
import os, aiofiles

router = APIRouter(prefix="/api/students", tags=["Students"])


@router.get("/")
async def get_students(
    page: int = 1,
    limit: int = 20,
    department: str = None,
    class_name: str = None,
    search: str = None,
    current_user=Depends(require_teacher_or_admin)
):
    db = get_db()
    query = {"role": "student"}
    if department:
        query["department"] = department
    if class_name:
        query["class_name"] = class_name
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"roll_number": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}}
        ]
    skip, lim = paginate(page, limit)
    students = await db.users.find(query, {"password": 0}).skip(skip).limit(lim).to_list(lim)
    total = await db.users.count_documents(query)
    return {"students": serialize_list(students), "total": total, "page": page, "limit": lim}


@router.get("/:id/profile")
async def get_student_profile(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    student = await db.users.find_one({"_id": ObjectId(student_id), "role": "student"}, {"password": 0})
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return serialize_doc(student)


@router.get("/profile")
async def get_my_profile(current_user=Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": current_user["_id"]}, {"password": 0})
    return serialize_doc(user)


@router.put("/profile")
async def update_profile(data: dict, current_user=Depends(get_current_user)):
    db = get_db()
    allowed = ["full_name", "phone", "address", "date_of_birth"]
    update_data = {k: v for k, v in data.items() if k in allowed}
    update_data["updated_at"] = datetime.utcnow()
    await db.users.update_one({"_id": current_user["_id"]}, {"$set": update_data})
    return {"message": "Profile updated successfully"}


@router.post("/profile/photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    from app.config import settings
    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG/WebP images allowed")
    if file.size and file.size > settings.max_file_size:
        raise HTTPException(status_code=400, detail="File too large")

    upload_dir = os.path.join(settings.upload_dir, "photos")
    os.makedirs(upload_dir, exist_ok=True)
    filename = f"{current_user['_id']}_{datetime.utcnow().timestamp()}{os.path.splitext(file.filename)[1]}"
    filepath = os.path.join(upload_dir, filename)

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        await f.write(content)

    photo_url = f"/uploads/photos/{filename}"
    await get_db().users.update_one(
        {"_id": current_user["_id"]}, {"$set": {"profile_photo": photo_url}}
    )
    return {"photo_url": photo_url}


@router.delete("/{student_id}")
async def delete_student(student_id: str, current_user=Depends(require_admin)):
    db = get_db()
    result = await db.users.update_one(
        {"_id": ObjectId(student_id), "role": "student"},
        {"$set": {"is_active": False, "deleted_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deactivated successfully"}


@router.get("/stats/overview")
async def get_student_stats(current_user=Depends(require_admin)):
    db = get_db()
    total = await db.users.count_documents({"role": "student", "is_active": True})
    by_dept = await db.users.aggregate([
        {"$match": {"role": "student", "is_active": True}},
        {"$group": {"_id": "$department", "count": {"$sum": 1}}}
    ]).to_list(100)
    return {"total_students": total, "by_department": by_dept}
