from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, index=True, nullable=False)
    department = Column(String(100), nullable=True)
    class_name = Column(String(100), nullable=True)
    section = Column(String(20), nullable=True)
    semester = Column(Integer, nullable=True)
    year = Column(Integer, nullable=True)
    parent_email = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(String(500), nullable=True)

    user = relationship("User", back_populates="student_profile")
