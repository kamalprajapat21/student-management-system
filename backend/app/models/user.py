from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    student = "student"
    teacher = "teacher"
    parent = "parent"
    admin = "admin"


class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: UserRole
    phone: Optional[str] = None
    profile_photo: Optional[str] = None
    is_active: bool = True


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPassword(BaseModel):
    email: EmailStr


class ResetPassword(BaseModel):
    token: str
    new_password: str


class ChangePassword(BaseModel):
    current_password: str
    new_password: str


class UserResponse(UserBase):
    id: str
    created_at: datetime
    last_login: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class StudentCreate(UserBase):
    password: str
    roll_number: str
    department: str
    class_name: str
    semester: int
    year: int
    parent_email: Optional[EmailStr] = None
    date_of_birth: Optional[str] = None
    address: Optional[str] = None


class TeacherCreate(UserBase):
    password: str
    employee_id: str
    department: str
    subjects: List[str] = []
    qualification: Optional[str] = None
    experience_years: Optional[int] = None


class ParentCreate(UserBase):
    password: str
    student_roll_number: str
    relationship: str = "parent"
