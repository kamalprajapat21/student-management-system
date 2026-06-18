from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user
from app.utils.helpers import serialize_doc
from app.database import get_db
from app.services.ai_service import (
    predict_performance,
    predict_attendance,
    get_study_recommendations
)

router = APIRouter(prefix="/api/ai", tags=["AI Features"])


@router.get("/predict/performance/{student_id}")
async def predict_student_performance(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    student = await db.users.find_one_or_none(student_id)
    result = await predict_performance(student_id, db)
    return result


@router.get("/predict/attendance/{student_id}")
async def predict_student_attendance(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = await predict_attendance(student_id, db)
    return result


@router.get("/recommendations/{student_id}")
async def get_recommendations(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    result = await get_study_recommendations(student_id, db)
    return result


@router.get("/dashboard/{student_id}")
async def get_ai_dashboard(student_id: str, current_user=Depends(get_current_user)):
    """Combined AI insights for student dashboard."""
    db = get_db()
    performance = await predict_performance(student_id, db)
    attendance_pred = await predict_attendance(student_id, db)
    recommendations = await get_study_recommendations(student_id, db)

    return {
        "performance_prediction": performance,
        "attendance_prediction": attendance_pred,
        "recommendations": recommendations
    }
