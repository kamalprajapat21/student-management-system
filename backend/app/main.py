from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from datetime import datetime
import os

from app.database import connect_to_mongo, close_mongo_connection
from app.config import settings
from app.routers import (
    auth, students, teachers, parents,
    attendance, assignments, fees, leaves,
    notices, notifications, timetable,
    exams, chatbot, ai, analytics
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    os.makedirs(settings.upload_dir, exist_ok=True)
    os.makedirs(os.path.join(settings.upload_dir, "photos"), exist_ok=True)
    os.makedirs(os.path.join(settings.upload_dir, "submissions"), exist_ok=True)
    os.makedirs(os.path.join(settings.upload_dir, "assignments"), exist_ok=True)
    yield
    await close_mongo_connection()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Based Student Management System API",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Audit log middleware
@app.middleware("http")
async def audit_middleware(request: Request, call_next):
    response = await call_next(request)
    return response

# Static files for uploads
if os.path.exists(settings.upload_dir):
    app.mount("/uploads", StaticFiles(directory=settings.upload_dir), name="uploads")

# Routers
app.include_router(auth.router)
app.include_router(students.router)
app.include_router(teachers.router)
app.include_router(parents.router)
app.include_router(attendance.router)
app.include_router(assignments.router)
app.include_router(fees.router)
app.include_router(leaves.router)
app.include_router(notices.router)
app.include_router(notifications.router)
app.include_router(timetable.router)
app.include_router(exams.router)
app.include_router(chatbot.router)
app.include_router(ai.router)
app.include_router(analytics.router)


@app.get("/")
async def root():
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running",
        "timestamp": datetime.utcnow().isoformat()
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}
