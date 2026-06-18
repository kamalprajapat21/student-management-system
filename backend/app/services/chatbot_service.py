from datetime import datetime
from bson import ObjectId


async def process_chatbot_query(message: str, user: dict, db) -> str:
    """Process chatbot query and return response from MongoDB data."""
    msg_lower = message.lower().strip()
    student_id = str(user["_id"])

    try:
        # Attendance queries
        if any(w in msg_lower for w in ["attendance", "present", "absent", "percentage"]):
            return await get_attendance_response(student_id, db)

        # Fee queries
        if any(w in msg_lower for w in ["fee", "payment", "due", "pending amount"]):
            return await get_fee_response(student_id, db)

        # Assignment queries
        if any(w in msg_lower for w in ["assignment", "homework", "submit", "deadline"]):
            return await get_assignment_response(student_id, db, user)

        # Exam queries
        if any(w in msg_lower for w in ["exam", "test", "quiz", "midterm", "final"]):
            return await get_exam_response(student_id, db, user)

        # Practical queries
        if any(w in msg_lower for w in ["practical", "lab", "viva"]):
            return await get_practical_response(student_id, db, user)

        # Notice queries
        if any(w in msg_lower for w in ["notice", "announcement", "circular"]):
            return await get_notice_response(db)

        # Marks queries
        if any(w in msg_lower for w in ["marks", "score", "result", "grade"]):
            return await get_marks_response(student_id, db)

        # Timetable
        if any(w in msg_lower for w in ["timetable", "schedule", "class time", "today"]):
            return await get_timetable_response(user, db)

        # Greeting
        if any(w in msg_lower for w in ["hello", "hi", "hey", "greetings"]):
            return f"Hello {user.get('full_name', '')}! 👋 I'm your AI Student Assistant. I can help you with:\n• Attendance status\n• Fee information\n• Assignment deadlines\n• Upcoming exams\n• Practical dates\n• Notices\n• Marks & grades\n\nWhat would you like to know?"

        # Help
        if any(w in msg_lower for w in ["help", "what can you", "commands"]):
            return ("I can help you with the following:\n"
                    "📊 **Attendance** - Check your attendance percentage\n"
                    "💰 **Fees** - Check fee status and due amounts\n"
                    "📝 **Assignments** - View pending assignments and deadlines\n"
                    "📚 **Exams** - Check upcoming exam dates\n"
                    "🔬 **Practicals** - View upcoming practical dates\n"
                    "📢 **Notices** - Get latest notices\n"
                    "🎯 **Marks** - Check your marks and grades\n"
                    "📅 **Timetable** - View your class schedule\n\n"
                    "Just ask me anything!")

        return ("I'm not sure about that. You can ask me about:\n"
                "• Your attendance, marks, fees\n"
                "• Assignment deadlines\n"
                "• Upcoming exams and practicals\n"
                "• Latest notices\n\nType 'help' for more options.")

    except Exception as e:
        return f"Sorry, I encountered an error processing your request. Please try again."


async def get_attendance_response(student_id: str, db) -> str:
    records = await db.attendance.find({"student_id": student_id}).to_list(1000)
    if not records:
        return "No attendance records found yet."
    total = len(records)
    present = sum(1 for r in records if r["status"] in ["present", "late"])
    pct = round(present / total * 100, 2) if total else 0
    status = "✅ Safe" if pct >= 75 else "⚠️ Warning" if pct >= 60 else "🔴 Critical"
    return (f"📊 **Your Attendance Summary:**\n"
            f"• Total Classes: {total}\n"
            f"• Present: {present}\n"
            f"• Absent: {total - present}\n"
            f"• Percentage: **{pct}%**\n"
            f"• Status: {status}\n\n"
            f"{'Keep it up! ✅' if pct >= 75 else 'Please attend more classes to reach the required 75%. ⚠️'}")


async def get_fee_response(student_id: str, db) -> str:
    fees = await db.fees.find({"student_id": student_id}).to_list(50)
    if not fees:
        return "No fee records found."
    pending = [f for f in fees if f["status"] in ["pending", "partial", "overdue"]]
    total_due = sum(f.get("due_amount", 0) for f in pending)
    if not pending:
        return "✅ All your fees are paid! No pending dues."
    response = f"💰 **Fee Status:**\n"
    for f in pending[:3]:
        response += f"• {f['fee_type']}: ₹{f['due_amount']:.0f} due on {str(f.get('due_date', ''))[:10]}\n"
    if len(pending) > 3:
        response += f"• ...and {len(pending) - 3} more\n"
    response += f"\n**Total Due: ₹{total_due:.0f}**\nPlease pay before the due date to avoid penalties."
    return response


async def get_assignment_response(student_id: str, db, user: dict) -> str:
    class_id = user.get("class_name")
    assignments = await db.assignments.find({"class_id": class_id}).sort("due_date", 1).to_list(20)
    if not assignments:
        return "No assignments found for your class."
    pending = []
    for a in assignments:
        sub = await db.submissions.find_one({"assignment_id": str(a["_id"]), "student_id": student_id})
        if not sub:
            pending.append(a)
    if not pending:
        return "✅ You have submitted all assignments! Great job!"
    response = f"📝 **Pending Assignments ({len(pending)}):**\n"
    for a in pending[:5]:
        response += f"• {a['title']} ({a['subject']}) - Due: {str(a.get('due_date', ''))[:10]}\n"
    return response


async def get_exam_response(student_id: str, db, user: dict) -> str:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    class_id = user.get("class_name")
    exams = await db.exams.find({
        "class_id": class_id,
        "exam_date": {"$gte": today},
        "exam_type": {"$ne": "practical"}
    }).sort("exam_date", 1).limit(5).to_list(5)
    if not exams:
        return "No upcoming exams scheduled."
    response = "📚 **Upcoming Exams:**\n"
    for e in exams:
        response += f"• {e['title']} ({e['subject']}) - {str(e.get('exam_date', ''))[:10]} at {e.get('start_time', '')}\n"
    return response


async def get_practical_response(student_id: str, db, user: dict) -> str:
    today = datetime.utcnow().strftime("%Y-%m-%d")
    class_id = user.get("class_name")
    practicals = await db.exams.find({
        "class_id": class_id,
        "exam_type": "practical",
        "exam_date": {"$gte": today}
    }).sort("exam_date", 1).limit(5).to_list(5)
    if not practicals:
        return "No upcoming practicals scheduled."
    response = "🔬 **Upcoming Practicals:**\n"
    for p in practicals:
        response += f"• {p['title']} ({p['subject']}) - {str(p.get('practical_date', p.get('exam_date', '')))[:10]} at {p.get('start_time', '')}\n"
    return response


async def get_notice_response(db) -> str:
    notices = await db.notices.find({"is_active": True}).sort(
        [("priority", -1), ("created_at", -1)]
    ).limit(3).to_list(3)
    if not notices:
        return "No recent notices."
    response = "📢 **Latest Notices:**\n"
    for n in notices:
        priority_icon = "🔴" if n.get("priority") == "urgent" else "🟡" if n.get("priority") == "high" else "🔵"
        response += f"{priority_icon} **{n['title']}**\n{n['content'][:150]}...\n\n"
    return response


async def get_marks_response(student_id: str, db) -> str:
    marks = await db.marks.find({"student_id": student_id}).to_list(100)
    if not marks:
        return "No marks records found yet."
    response = "🎯 **Your Marks:**\n"
    for m in marks[:5]:
        exam = await db.exams.find_one({"_id": ObjectId(m["exam_id"])})
        if exam:
            pct = (m.get("marks_obtained", 0) / exam.get("total_marks", 100)) * 100
            grade = "A+" if pct >= 90 else "A" if pct >= 80 else "B" if pct >= 70 else "C" if pct >= 60 else "D" if pct >= 50 else "F"
            response += f"• {exam['subject']} ({exam['exam_type']}): {m.get('marks_obtained')}/{exam['total_marks']} ({pct:.1f}%) - Grade: {grade}\n"
    return response


async def get_timetable_response(user: dict, db) -> str:
    class_id = user.get("class_name")
    if not class_id:
        return "No class assigned to your profile."
    timetable = await db.timetables.find_one({"class_id": class_id}, sort=[("created_at", -1)])
    if not timetable:
        return "Timetable not yet uploaded for your class."
    today = datetime.utcnow().strftime("%A")
    today_slots = [s for s in timetable.get("slots", []) if s.get("day", "").lower() == today.lower()]
    if not today_slots:
        return f"No classes scheduled for today ({today})."
    response = f"📅 **Today's Schedule ({today}):**\n"
    for slot in sorted(today_slots, key=lambda x: x.get("start_time", "")):
        response += f"• {slot['start_time']}-{slot['end_time']}: {slot['subject']} by {slot.get('teacher_name', 'TBD')} (Room: {slot.get('room', 'TBD')})\n"
    return response
