from fastapi import APIRouter, HTTPException, status, Depends, BackgroundTasks
from app.models.user import (
    UserLogin, StudentCreate, TeacherCreate, ParentCreate,
    ForgotPassword, ResetPassword, ChangePassword
)
from app.utils.password_handler import hash_password, verify_password
from app.utils.jwt_handler import create_access_token
from app.utils.helpers import serialize_doc, generate_reset_token, validate_email
from app.utils.auth_deps import get_current_user
from app.database import get_db
from app.services.email_service import send_password_reset_email
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login")
async def login(credentials: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    if not user.get("is_active", True):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    await db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {"last_login": datetime.utcnow()}}
    )
    await db.audit_logs.insert_one({
        "user_id": str(user["_id"]),
        "action": "login",
        "timestamp": datetime.utcnow(),
        "ip": None
    })
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": serialize_doc(user)
    }


@router.post("/register/student", status_code=201)
async def register_student(data: StudentCreate):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"roll_number": data.roll_number}):
        raise HTTPException(status_code=400, detail="Roll number already exists")

    user_doc = {
        **data.model_dump(exclude={"password"}),
        "password": hash_password(data.password),
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return {"message": "Student registered successfully", "user": serialize_doc(user_doc)}


@router.post("/register/teacher", status_code=201)
async def register_teacher(data: TeacherCreate):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    if await db.users.find_one({"employee_id": data.employee_id}):
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    user_doc = {
        **data.model_dump(exclude={"password"}),
        "password": hash_password(data.password),
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return {"message": "Teacher registered successfully", "user": serialize_doc(user_doc)}


@router.post("/register/parent", status_code=201)
async def register_parent(data: ParentCreate):
    db = get_db()
    if await db.users.find_one({"email": data.email}):
        raise HTTPException(status_code=400, detail="Email already registered")
    student = await db.users.find_one({
        "roll_number": data.student_roll_number, "role": "student"
    })
    if not student:
        raise HTTPException(status_code=404, detail="Student not found with this roll number")

    user_doc = {
        **data.model_dump(exclude={"password"}),
        "password": hash_password(data.password),
        "student_id": str(student["_id"]),
        "created_at": datetime.utcnow(),
        "is_active": True,
    }
    result = await db.users.insert_one(user_doc)
    user_doc["_id"] = result.inserted_id
    return {"message": "Parent registered successfully", "user": serialize_doc(user_doc)}


@router.post("/forgot-password")
async def forgot_password(data: ForgotPassword, background_tasks: BackgroundTasks):
    db = get_db()
    user = await db.users.find_one({"email": data.email})
    if not user:
        # Don't reveal if email exists
        return {"message": "If this email exists, a reset link has been sent"}

    token = generate_reset_token()
    expires = datetime.utcnow() + timedelta(hours=1)
    await db.password_reset_tokens.insert_one({
        "user_id": str(user["_id"]),
        "token": token,
        "expires_at": expires,
        "used": False
    })
    background_tasks.add_task(
        send_password_reset_email, user["email"], user["full_name"], token
    )
    return {"message": "If this email exists, a reset link has been sent"}


@router.post("/reset-password")
async def reset_password(data: ResetPassword):
    db = get_db()
    token_doc = await db.password_reset_tokens.find_one({
        "token": data.token, "used": False
    })
    if not token_doc or token_doc["expires_at"] < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    hashed = hash_password(data.new_password)
    await db.users.update_one(
        {"_id": ObjectId(token_doc["user_id"])},
        {"$set": {"password": hashed}}
    )
    await db.password_reset_tokens.update_one(
        {"_id": token_doc["_id"]}, {"$set": {"used": True}}
    )
    return {"message": "Password reset successfully"}


@router.post("/change-password")
async def change_password(data: ChangePassword, current_user=Depends(get_current_user)):
    db = get_db()
    if not verify_password(data.current_password, current_user["password"]):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    hashed = hash_password(data.new_password)
    await db.users.update_one(
        {"_id": current_user["_id"]}, {"$set": {"password": hashed}}
    )
    return {"message": "Password changed successfully"}


@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return serialize_doc(current_user)
