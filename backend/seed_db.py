import sys, os, random
sys.path.insert(0, os.path.dirname(__file__))

from app.database import SessionLocal, create_tables
from app.models.user import User, UserRole
from app.models.student import StudentProfile
from app.models.teacher import TeacherProfile
from app.models.subject import Subject
from app.models.attendance import Attendance, AttendanceStatus
from app.models.exam import Exam, Mark, ExamType
from app.models.fee import Fee, FeeStatus
from app.models.notice import Notice, TargetRole
from app.utils.password_handler import hash_password
from app.utils.helpers import calculate_grade
from datetime import datetime, date, timedelta


def seed():
    create_tables()
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.email == "admin@school.com").first():
            db.add(User(email="admin@school.com", full_name="System Admin",
                        hashed_password=hash_password("Admin@123"),
                        role=UserRole.admin, phone="9000000000"))
            db.commit()
            print("Created admin: admin@school.com / Admin@123")

        teacher_data = [
            ("teacher1@school.com", "Dr. Priya Sharma", "T001", "Mathematics"),
            ("teacher2@school.com", "Prof. Raj Kumar", "T002", "Physics"),
            ("teacher3@school.com", "Ms. Anita Singh", "T003", "Computer Science"),
        ]
        teachers = []
        for email, name, emp_id, dept in teacher_data:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, full_name=name,
                         hashed_password=hash_password("Teacher@123"),
                         role=UserRole.teacher)
                db.add(u)
                db.flush()
                db.add(TeacherProfile(user_id=u.id, employee_id=emp_id, department=dept,
                                       experience_years=random.randint(5, 20)))
                db.commit()
                print(f"Created teacher: {email} / Teacher@123")
            teachers.append(u)

        subjects_list = []
        for i, (name, code, cls, sem) in enumerate([
            ("Mathematics", "MATH101", "CS-3A", 3),
            ("Physics", "PHY101", "CS-3A", 3),
            ("Computer Science", "CS101", "CS-3A", 4),
        ]):
            s = db.query(Subject).filter(Subject.code == code).first()
            if not s:
                s = Subject(name=name, code=code, class_name=cls, semester=sem,
                             teacher_id=teachers[i % len(teachers)].id if teachers else None)
                db.add(s)
                db.flush()
                db.commit()
            subjects_list.append(s)

        students = []
        parent_email_map = {
            "student1@school.com": "parent1@school.com",
            "student2@school.com": "parent2@school.com",
            "student3@school.com": "parent3@school.com",
            "student4@school.com": "parent4@school.com",
            "student5@school.com": "parent5@school.com",
        }
        for email, name, roll in [
            ("student1@school.com", "Arjun Mehta", "S001"),
            ("student2@school.com", "Priya Patel", "S002"),
            ("student3@school.com", "Rahul Singh", "S003"),
            ("student4@school.com", "Kavya Nair", "S004"),
            ("student5@school.com", "Vikram Rao", "S005"),
        ]:
            u = db.query(User).filter(User.email == email).first()
            if not u:
                u = User(email=email, full_name=name,
                         hashed_password=hash_password("Student@123"),
                         role=UserRole.student)
                db.add(u)
                db.flush()
                db.add(StudentProfile(user_id=u.id, roll_number=roll,
                                      department="Computer Science", class_name="CS-3A",
                                      section="A", semester=3, year=2,
                                      parent_email=parent_email_map[email]))
                db.commit()
                print(f"Created student: {email} / Student@123")
            students.append(u)

        # Create parent accounts linked to students via parent_email
        parent_data = [
            ("parent1@school.com", "Mr. Suresh Mehta"),
            ("parent2@school.com", "Mrs. Rekha Patel"),
            ("parent3@school.com", "Mr. Anil Singh"),
            ("parent4@school.com", "Mrs. Suma Nair"),
            ("parent5@school.com", "Mr. Krishna Rao"),
        ]
        for p_email, p_name in parent_data:
            if not db.query(User).filter(User.email == p_email).first():
                db.add(User(email=p_email, full_name=p_name,
                            hashed_password=hash_password("Parent@123"),
                            role=UserRole.parent))
                db.commit()
                print(f"Created parent: {p_email} / Parent@123")

        for student in students:
            for i in range(30):
                att_date = date.today() - timedelta(days=i)
                for subject in subjects_list[:2]:
                    if not db.query(Attendance).filter(
                        Attendance.student_id == student.id,
                        Attendance.date == att_date,
                        Attendance.subject_id == subject.id
                    ).first():
                        status = random.choices(
                            [AttendanceStatus.present, AttendanceStatus.absent],
                            weights=[80, 20])[0]
                        db.add(Attendance(student_id=student.id, subject_id=subject.id,
                                          date=att_date, status=status,
                                          marked_by_id=teachers[0].id if teachers else None))
        db.commit()

        for subject in subjects_list[:2]:
            for etype in [ExamType.midterm, ExamType.final]:
                title = f"{subject.name} {etype.value.title()}"
                if not db.query(Exam).filter(Exam.title == title, Exam.subject_id == subject.id).first():
                    exam = Exam(title=title, subject_id=subject.id,
                                exam_date=datetime.now() - timedelta(days=random.randint(10, 60)),
                                exam_type=etype, total_marks=100.0, class_name="CS-3A")
                    db.add(exam)
                    db.flush()
                    for student in students:
                        mv = random.uniform(35, 98)
                        db.add(Mark(student_id=student.id, exam_id=exam.id,
                                    marks_obtained=round(mv, 2),
                                    grade=calculate_grade(mv, 100)))
                    db.commit()

        for student in students:
            for ftype, amt in [("Tuition", 5000), ("Library", 1000), ("Lab", 1500)]:
                if not db.query(Fee).filter(Fee.student_id == student.id, Fee.fee_type == ftype).first():
                    is_paid = random.choice([True, False])
                    db.add(Fee(student_id=student.id, amount=amt, fee_type=ftype,
                               due_date=datetime.now() + timedelta(days=30),
                               status=FeeStatus.paid if is_paid else FeeStatus.unpaid,
                               payment_date=datetime.now() if is_paid else None))
        db.commit()

        for title, desc in [
            ("Semester Exam Schedule", "Mid-semester exams start next Monday."),
            ("Holiday Notice", "School closed on National Holiday."),
            ("Assignment Reminder", "Assignment deadline is this Friday."),
        ]:
            if not db.query(Notice).filter(Notice.title == title).first():
                db.add(Notice(title=title, description=desc, target_role=TargetRole.all))
        db.commit()

        print("\nDatabase seeded!")
        print("  Admin:   admin@school.com / Admin@123")
        print("  Teacher: teacher1@school.com / Teacher@123")
        print("  Student: student1@school.com / Student@123")
        print("  Parent:  parent1@school.com / Parent@123")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
