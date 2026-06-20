from sqlalchemy import Column, Integer, Date, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
from app.database import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    subject_id = Column(Integer, ForeignKey("subjects.id", ondelete="SET NULL"), nullable=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(SAEnum(AttendanceStatus), nullable=False, default=AttendanceStatus.present)
    marked_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User", foreign_keys=[student_id], backref="attendances")
    subject = relationship("Subject", back_populates="attendance_records")
    marked_by = relationship("User", foreign_keys=[marked_by_id], back_populates="attendance_marked")
