from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum as SAEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class ExamType(str, enum.Enum):
    midterm = "midterm"
    final = "final"
    quiz = "quiz"
    practical = "practical"


class Exam(Base):
    __tablename__ = "exams"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    exam_date = Column(DateTime, nullable=False)
    exam_type = Column(SAEnum(ExamType), nullable=False, default=ExamType.midterm)
    total_marks = Column(Float, default=100.0)
    passing_marks = Column(Float, default=40.0)
    duration_minutes = Column(Integer, default=180)
    class_name = Column(String(100), nullable=True)
    section = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    subject = relationship("Subject", back_populates="exams")
    marks = relationship("Mark", back_populates="exam", cascade="all, delete-orphan")


class Mark(Base):
    __tablename__ = "marks"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    exam_id = Column(Integer, ForeignKey("exams.id", ondelete="CASCADE"), nullable=False)
    marks_obtained = Column(Float, nullable=False)
    grade = Column(String(5), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], backref="marks")
    exam = relationship("Exam", back_populates="marks")
