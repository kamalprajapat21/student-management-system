from sqlalchemy.orm import Session
from app.models.attendance import Attendance
from app.models.exam import Mark
from app.models.assignment import Assignment, Submission
from app.models.user import User
from app.config import settings
from typing import Optional


def _get_student_stats(student_id: int, db: Session) -> dict:
    records = db.query(Attendance).filter(Attendance.student_id == student_id).all()
    total = len(records)
    present = sum(1 for r in records if r.status.value in ("present", "late"))
    att_pct = round((present / total) * 100, 2) if total > 0 else 0

    marks = db.query(Mark).filter(Mark.student_id == student_id).all()
    avg_marks = round(sum(m.marks_obtained for m in marks) / len(marks), 2) if marks else 0.0

    all_assignments = db.query(Assignment).filter(Assignment.is_active == True).count()
    submitted = db.query(Submission).filter(Submission.student_id == student_id).count()
    assign_pct = round((submitted / all_assignments) * 100, 2) if all_assignments > 0 else 0

    return {"attendance_pct": att_pct, "avg_marks": avg_marks,
            "assignment_pct": assign_pct, "total_classes": total, "present": present}


def predict_performance(student_id: int, db: Session) -> dict:
    stats = _get_student_stats(student_id, db)
    att_pct, avg_marks, assign_pct = stats["attendance_pct"], stats["avg_marks"], stats["assignment_pct"]

    risk_score = 0
    if att_pct < 60:
        risk_score += 40
    elif att_pct < 75:
        risk_score += 20
    elif att_pct < 85:
        risk_score += 10

    if avg_marks < 40:
        risk_score += 40
    elif avg_marks < 60:
        risk_score += 20
    elif avg_marks < 75:
        risk_score += 10

    if assign_pct < 50:
        risk_score += 20
    elif assign_pct < 75:
        risk_score += 10

    if risk_score >= 60:
        level, prediction = "high", "Weak"
    elif risk_score >= 30:
        level, prediction = "medium", "Average"
    elif risk_score >= 10:
        level, prediction = "low", "Good"
    else:
        level, prediction = "low", "Excellent"

    return {
        "student_id": student_id, "prediction": prediction, "risk_level": level,
        "risk_score": risk_score, "attendance_percentage": att_pct,
        "average_marks": avg_marks, "assignment_completion": assign_pct,
    }


def get_ai_recommendations(student_id: int, db: Session) -> dict:
    stats = _get_student_stats(student_id, db)
    att_pct, avg_marks, assign_pct = stats["attendance_pct"], stats["avg_marks"], stats["assignment_pct"]

    recommendations = []
    warnings = []

    if att_pct < 75:
        warnings.append(f"Your attendance is {att_pct}% - below the 75% minimum requirement.")
        recommendations.append("Attend classes regularly to avoid shortage.")
        recommendations.append("Contact your teacher if you have valid reasons for absence.")

    if avg_marks < 60:
        warnings.append(f"Your average marks are {avg_marks}% - needs improvement.")
        recommendations.append("Practice previous year papers.")
        recommendations.append("Revise weak subjects daily.")
        recommendations.append("Attend doubt-clearing sessions.")

    if assign_pct < 75:
        warnings.append(f"Only {assign_pct}% assignments submitted.")
        recommendations.append("Complete and submit pending assignments on time.")

    if not warnings:
        recommendations.append("Keep up the excellent work!")
        recommendations.append("Consider helping peers who may be struggling.")

    gemini_suggestion = _get_gemini_insight(att_pct, avg_marks, assign_pct)
    if gemini_suggestion:
        recommendations.append(gemini_suggestion)

    return {
        "student_id": student_id, "warnings": warnings,
        "recommendations": recommendations,
        "attendance_percentage": att_pct, "average_marks": avg_marks,
        "assignment_completion": assign_pct,
    }


def chat_with_ai(message: str, user: User, db: Session) -> str:
    context = _build_student_context(user, db)
    gemini_response = _query_gemini(message, context)
    if gemini_response:
        return gemini_response
    return _rule_based_chat(message, user, db)


def _build_student_context(user: User, db: Session) -> str:
    if user.role.value != "student":
        return f"User: {user.full_name}, Role: {user.role.value}"
    stats = _get_student_stats(user.id, db)
    return (
        f"Student: {user.full_name}\n"
        f"Attendance: {stats['attendance_pct']}%\n"
        f"Average Marks: {stats['avg_marks']}%\n"
        f"Assignment Completion: {stats['assignment_pct']}%\n"
    )


def _query_gemini(message: str, context: str) -> Optional[str]:
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"You are an AI assistant for a Student Management System.\n"
            f"Student context:\n{context}\n\n"
            f"Student asks: {message}\n\n"
            f"Provide a helpful, concise response (2-3 sentences max)."
        )
        response = model.generate_content(prompt)
        return response.text
    except Exception:
        return None


def _get_gemini_insight(att_pct: float, avg_marks: float, assign_pct: float) -> Optional[str]:
    if not settings.gemini_api_key:
        return None
    try:
        import google.generativeai as genai
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        prompt = (
            f"Student: attendance {att_pct}%, avg marks {avg_marks}%, "
            f"assignment completion {assign_pct}%. "
            f"Give ONE specific, actionable study tip in 1 sentence."
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return None


def _rule_based_chat(message: str, user: User, db: Session) -> str:
    msg = message.lower()
    if any(w in msg for w in ["attendance", "present", "absent"]):
        if user.role.value == "student":
            records = db.query(Attendance).filter(Attendance.student_id == user.id).all()
            total = len(records)
            present = sum(1 for r in records if r.status.value in ("present", "late"))
            pct = round((present / total) * 100, 2) if total > 0 else 0
            return f"Your attendance is {pct}% ({present}/{total} classes attended)."
        return "Please log in as a student to see attendance."

    if any(w in msg for w in ["marks", "score", "grade", "result"]):
        if user.role.value == "student":
            marks = db.query(Mark).filter(Mark.student_id == user.id).all()
            if not marks:
                return "No marks recorded yet."
            avg = round(sum(m.marks_obtained for m in marks) / len(marks), 2)
            return f"You have {len(marks)} exam result(s). Your average score is {avg}%."
        return "Please log in as a student to see marks."

    if any(w in msg for w in ["assignment", "homework"]):
        if user.role.value == "student":
            total = db.query(Assignment).filter(Assignment.is_active == True).count()
            submitted = db.query(Submission).filter(Submission.student_id == user.id).count()
            return f"There are {total} active assignments. You have submitted {submitted}."
        return "Assignment info is available in the Assignments section."

    if any(w in msg for w in ["fee", "payment", "dues"]):
        if user.role.value == "student":
            from app.models.fee import Fee
            fees = db.query(Fee).filter(Fee.student_id == user.id).all()
            pending = sum(f.amount for f in fees if f.status.value != "paid")
            return f"You have pending fees of Rs {pending:.0f}."
        return "Fee information is in the Fees section."

    return (
        "I can help with attendance, marks, assignments, fees, and study tips. "
        "What would you like to know?"
    )
