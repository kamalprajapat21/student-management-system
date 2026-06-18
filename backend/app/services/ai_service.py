import numpy as np
from typing import Optional
from bson import ObjectId


async def predict_performance(student_id: str, db) -> dict:
    """Predict student performance risk using attendance, marks, and assignment data."""
    try:
        # Get attendance
        records = await db.attendance.find({"student_id": student_id}).to_list(1000)
        total = len(records)
        present = sum(1 for r in records if r["status"] in ["present", "late"])
        attendance_pct = (present / total * 100) if total > 0 else 0

        # Get marks
        marks = await db.marks.find({"student_id": student_id}).to_list(100)
        avg_marks = 0
        if marks:
            total_marks = [m.get("marks_obtained", 0) for m in marks if m.get("marks_obtained") is not None]
            avg_marks = np.mean(total_marks) if total_marks else 0

        # Get assignment completion
        assignments = await db.assignments.find().to_list(100)
        total_assignments = len(assignments)
        submitted = 0
        if total_assignments > 0:
            for a in assignments:
                sub = await db.submissions.find_one(
                    {"assignment_id": str(a["_id"]), "student_id": student_id}
                )
                if sub:
                    submitted += 1
        assignment_pct = (submitted / total_assignments * 100) if total_assignments > 0 else 0

        # Risk scoring
        risk_score = 0
        weak_subjects = []

        if attendance_pct < 60:
            risk_score += 40
        elif attendance_pct < 75:
            risk_score += 20
        elif attendance_pct < 85:
            risk_score += 10

        if avg_marks < 40:
            risk_score += 40
        elif avg_marks < 60:
            risk_score += 20
        elif avg_marks < 75:
            risk_score += 10

        if assignment_pct < 50:
            risk_score += 20
        elif assignment_pct < 75:
            risk_score += 10

        # Find weak subjects
        subject_marks = {}
        for m in marks:
            exam = await db.exams.find_one({"_id": ObjectId(m["exam_id"])})
            if exam:
                subj = exam["subject"]
                if subj not in subject_marks:
                    subject_marks[subj] = []
                pct = (m.get("marks_obtained", 0) / exam.get("total_marks", 100)) * 100
                subject_marks[subj].append(pct)

        for subj, pcts in subject_marks.items():
            avg = np.mean(pcts)
            if avg < 60:
                weak_subjects.append({"subject": subj, "average": round(avg, 2), "status": "weak"})

        risk_level = "low"
        if risk_score >= 60:
            risk_level = "high"
        elif risk_score >= 30:
            risk_level = "medium"

        return {
            "student_id": student_id,
            "risk_level": risk_level,
            "risk_score": risk_score,
            "metrics": {
                "attendance_percentage": round(attendance_pct, 2),
                "average_marks": round(float(avg_marks), 2),
                "assignment_completion": round(assignment_pct, 2)
            },
            "weak_subjects": weak_subjects,
            "recommendations": _get_performance_recommendations(risk_level, attendance_pct, avg_marks, assignment_pct)
        }
    except Exception as e:
        return {"error": str(e), "student_id": student_id}


async def predict_attendance(student_id: str, db) -> dict:
    """Predict final attendance percentage based on current trend."""
    try:
        records = await db.attendance.find({"student_id": student_id}).sort("date", 1).to_list(1000)
        if not records:
            return {"prediction": "No data available", "student_id": student_id}

        total = len(records)
        present = sum(1 for r in records if r["status"] in ["present", "late"])
        current_pct = (present / total * 100) if total > 0 else 0

        # Simple linear trend prediction
        # Assume semester has ~180 classes total
        total_expected = 180
        remaining = max(0, total_expected - total)
        # Predict if trend continues
        predicted_present = present + (remaining * (present / total if total > 0 else 0.75))
        predicted_pct = (predicted_present / total_expected * 100) if total_expected > 0 else 0

        # Classes needed to reach 75%
        if current_pct < 75 and remaining > 0:
            required_for_75 = max(0, (0.75 * total_expected - present))
            classes_needed = int(required_for_75)
        else:
            classes_needed = 0

        status = "safe" if predicted_pct >= 75 else "warning" if predicted_pct >= 60 else "critical"

        return {
            "student_id": student_id,
            "current_percentage": round(current_pct, 2),
            "predicted_final_percentage": round(predicted_pct, 2),
            "status": status,
            "total_classes_attended": present,
            "total_classes_held": total,
            "remaining_classes": remaining,
            "classes_needed_for_75_percent": classes_needed,
            "message": _get_attendance_message(status, current_pct, predicted_pct)
        }
    except Exception as e:
        return {"error": str(e), "student_id": student_id}


async def get_study_recommendations(student_id: str, db) -> dict:
    """Generate study recommendations based on performance data."""
    try:
        marks = await db.marks.find({"student_id": student_id}).to_list(100)

        recommendations = []
        subject_performance = {}

        for m in marks:
            exam = await db.exams.find_one({"_id": ObjectId(m["exam_id"])})
            if exam:
                subj = exam["subject"]
                pct = (m.get("marks_obtained", 0) / exam.get("total_marks", 100)) * 100
                if subj not in subject_performance:
                    subject_performance[subj] = []
                subject_performance[subj].append(pct)

        for subj, perfs in subject_performance.items():
            avg = np.mean(perfs)
            if avg < 40:
                recommendations.append({
                    "subject": subj,
                    "priority": "urgent",
                    "current_score": round(float(avg), 2),
                    "suggestions": [
                        f"Focus heavily on {subj} fundamentals",
                        "Consider extra tutoring or study groups",
                        "Review all previous exam papers",
                        "Practice daily problems for 2+ hours",
                        "Consult teacher during office hours"
                    ],
                    "resources": [
                        f"NPTEL lectures on {subj}",
                        f"Khan Academy - {subj} basics",
                        "Previous year question papers"
                    ]
                })
            elif avg < 60:
                recommendations.append({
                    "subject": subj,
                    "priority": "high",
                    "current_score": round(float(avg), 2),
                    "suggestions": [
                        f"Revise weak topics in {subj}",
                        "Solve practice problems daily",
                        "Create summary notes for revision",
                        "Join peer study sessions"
                    ],
                    "resources": [
                        f"YouTube tutorials on weak {subj} topics",
                        "Textbook exercises",
                        "Online mock tests"
                    ]
                })
            elif avg < 75:
                recommendations.append({
                    "subject": subj,
                    "priority": "medium",
                    "current_score": round(float(avg), 2),
                    "suggestions": [
                        f"Good progress in {subj}! Focus on advanced topics",
                        "Attempt more challenging problems",
                        "Review recent exam mistakes"
                    ],
                    "resources": [
                        "Advanced problem sets",
                        "Reference books for deeper understanding"
                    ]
                })

        return {
            "student_id": student_id,
            "recommendations": sorted(recommendations, key=lambda x: {"urgent": 0, "high": 1, "medium": 2}.get(x["priority"], 3)),
            "overall_suggestion": _get_overall_suggestion(subject_performance)
        }
    except Exception as e:
        return {"error": str(e), "student_id": student_id}


def _get_performance_recommendations(risk: str, att: float, marks: float, assign: float) -> list:
    recs = []
    if att < 75:
        recs.append("Improve attendance - currently below required 75%")
    if marks < 60:
        recs.append("Focus on improving exam scores through regular practice")
    if assign < 75:
        recs.append("Complete pending assignments on time")
    if risk == "low":
        recs.append("Great performance! Keep it up and aim for distinction")
    return recs


def _get_attendance_message(status: str, current: float, predicted: float) -> str:
    if status == "safe":
        return f"Your attendance trend looks good. Predicted final: {predicted:.1f}%"
    elif status == "warning":
        return f"Warning: If trend continues, final attendance may be {predicted:.1f}%. Attend more classes."
    else:
        return f"Critical: Attendance trend is very concerning. Predicted final: {predicted:.1f}%. Immediate action needed."


def _get_overall_suggestion(subject_performance: dict) -> str:
    if not subject_performance:
        return "No marks data available yet."
    all_avgs = [np.mean(perfs) for perfs in subject_performance.values()]
    overall = np.mean(all_avgs)
    if overall >= 80:
        return "Excellent overall performance! Consider applying for merit scholarships."
    elif overall >= 65:
        return "Good performance. Focus on weak subjects to improve overall GPA."
    elif overall >= 50:
        return "Average performance. Create a structured study plan and seek teacher guidance."
    else:
        return "Performance needs significant improvement. Seek academic counseling immediately."
