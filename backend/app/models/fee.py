from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FeeStatus(str, Enum):
    paid = "paid"
    pending = "pending"
    overdue = "overdue"
    partial = "partial"


class FeeCreate(BaseModel):
    student_id: str
    fee_type: str  # tuition, hostel, transport, exam, etc.
    amount: float
    due_date: str
    semester: int
    academic_year: str
    description: Optional[str] = None


class FeePayment(BaseModel):
    fee_id: str
    amount_paid: float
    payment_method: str  # cash, online, cheque
    transaction_id: Optional[str] = None
    remarks: Optional[str] = None


class FeeResponse(BaseModel):
    id: str
    student_id: str
    fee_type: str
    amount: float
    amount_paid: float
    due_amount: float
    due_date: str
    status: FeeStatus
    payment_history: List[dict]
    semester: int
    academic_year: str
