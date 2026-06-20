from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.exam import Exam, Mark
from app.models.user import User
from app.schemas.exam import ExamCreate, MarkCreate
from app.utils.auth_deps import get_current_user, require_teacher_or_admin
from app.utils.helpers import calculate_grade

router = APIRouter(prefix="/api/exams", tags=["Exams & Marks"])


@router.get("")
def list_exams(
    class_name: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    q = db.query(Exam)
    if class_name:
        q = q.filter(Exam.class_name == class_name)
    exams = q.order_by(Exam.exam_date.desc()).all()
    return {"exams": [
        {"id": e.id, "title": e.title, "exam_type": e.exam_type.value,
         "exam_date": e.exam_date, "total_marks": e.total_marks,
         "subject_id": e.subject_id, "class_name": e.class_name} for e in exams]}


@router.post("", status_code=201)
def create_exam(data: ExamCreate, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    from app.models.exam import ExamType
    exam = Exam(
        title=data.title, subject_id=data.subject_id, exam_date=data.exam_date,
        exam_type=ExamType(data.exam_type), total_marks=data.total_marks,
        passing_marks=data.passing_marks, duration_minutes=data.duration_minutes,
        class_name=data.class_name, section=data.section,
    )
    db.add(exam)
    db.commit()
    db.refresh(exam)
    return {"message": "Exam created", "id": exam.id}


@router.post("/marks", status_code=201)
def add_marks(data: MarkCreate, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    exam = db.query(Exam).filter(Exam.id == data.exam_id).first()
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    existing = db.query(Mark).filter(Mark.student_id == data.student_id, Mark.exam_id == data.exam_id).first()
    grade = data.grade or calculate_grade(data.marks_obtained, exam.total_marks)
    if existing:
        existing.marks_obtained = data.marks_obtained
        existing.grade = grade
        existing.remarks = data.remarks
        db.commit()
        return {"message": "Marks updated"}
    mark = Mark(student_id=data.student_id, exam_id=data.exam_id,
                marks_obtained=data.marks_obtained, grade=grade, remarks=data.remarks)
    db.add(mark)
    db.commit()
    return {"message": "Marks added"}


@router.get("/{exam_id}/marks")
def get_exam_marks(exam_id: int, _=Depends(require_teacher_or_admin), db: Session = Depends(get_db)):
    marks = db.query(Mark).filter(Mark.exam_id == exam_id).all()
    return {"marks": [{"id": m.id, "student_id": m.student_id,
                        "marks_obtained": m.marks_obtained, "grade": m.grade} for m in marks]}
