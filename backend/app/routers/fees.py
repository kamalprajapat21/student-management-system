from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database import get_db
from app.models.fee import Fee, FeeStatus
from app.schemas.fee import FeeCreate, FeeUpdate
from app.utils.auth_deps import require_admin

router = APIRouter(prefix="/api/fees", tags=["Fees"])


@router.get("")
def list_all_fees(status: Optional[str] = None, _=Depends(require_admin), db: Session = Depends(get_db)):
    q = db.query(Fee)
    if status:
        q = q.filter(Fee.status == FeeStatus(status))
    fees = q.all()
    return {"fees": [{"id": f.id, "student_id": f.student_id, "amount": f.amount,
                       "fee_type": f.fee_type, "status": f.status.value,
                       "due_date": f.due_date, "payment_date": f.payment_date} for f in fees]}


@router.post("", status_code=201)
def create_fee(data: FeeCreate, _=Depends(require_admin), db: Session = Depends(get_db)):
    fee = Fee(**data.model_dump())
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return {"message": "Fee record created", "id": fee.id}


@router.put("/{fee_id}/pay")
def pay_fee(fee_id: int, data: FeeUpdate, _=Depends(require_admin), db: Session = Depends(get_db)):
    fee = db.query(Fee).filter(Fee.id == fee_id).first()
    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")
    fee.status = FeeStatus(data.status) if data.status else FeeStatus.paid
    fee.payment_date = data.payment_date or datetime.utcnow()
    fee.transaction_id = data.transaction_id
    db.commit()
    return {"message": "Fee payment recorded"}


@router.get("/stats")
def fee_stats(_=Depends(require_admin), db: Session = Depends(get_db)):
    all_fees = db.query(Fee).all()
    total = sum(f.amount for f in all_fees)
    paid = sum(f.amount for f in all_fees if f.status.value == "paid")
    return {"total": total, "paid": paid, "pending": total - paid,
            "count_paid": sum(1 for f in all_fees if f.status.value == "paid"),
            "count_unpaid": sum(1 for f in all_fees if f.status.value != "paid")}
