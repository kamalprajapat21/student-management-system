from fastapi import APIRouter, HTTPException, Depends, Response
from app.utils.auth_deps import get_current_user, require_admin
from app.utils.helpers import serialize_doc, serialize_list
from app.models.fee import FeeCreate, FeePayment
from app.database import get_db
from app.services.pdf_service import generate_fee_receipt
from app.services.notification_service import create_notification
from bson import ObjectId
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/fees", tags=["Fees"])


@router.post("/")
async def create_fee(data: FeeCreate, current_user=Depends(require_admin)):
    db = get_db()
    doc = {
        **data.model_dump(),
        "amount_paid": 0,
        "due_amount": data.amount,
        "status": "pending",
        "payment_history": [],
        "created_at": datetime.utcnow(),
        "created_by": str(current_user["_id"])
    }
    result = await db.fees.insert_one(doc)
    doc["_id"] = result.inserted_id

    # Notify student
    student = await db.users.find_one({"_id": ObjectId(data.student_id)})
    if student:
        await create_notification(
            user_id=data.student_id,
            title="New Fee Added",
            message=f"A fee of ₹{data.amount} for {data.fee_type} is due on {data.due_date}.",
            notification_type="fee_reminder",
            reference_id=str(result.inserted_id),
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
    return {"message": "Fee created", "fee": serialize_doc(doc)}


@router.get("/student/{student_id}")
async def get_student_fees(student_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    fees = await db.fees.find({"student_id": student_id}).to_list(50)
    total_due = sum(f.get("due_amount", 0) for f in fees)
    total_paid = sum(f.get("amount_paid", 0) for f in fees)
    return {
        "fees": serialize_list(fees),
        "summary": {"total_due": total_due, "total_paid": total_paid}
    }


@router.post("/pay")
async def pay_fee(data: FeePayment, current_user=Depends(get_current_user)):
    db = get_db()
    fee = await db.fees.find_one({"_id": ObjectId(data.fee_id)})
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")

    new_paid = fee["amount_paid"] + data.amount_paid
    new_due = fee["amount"] - new_paid
    new_status = "paid" if new_due <= 0 else "partial"

    payment_record = {
        "amount": data.amount_paid,
        "method": data.payment_method,
        "transaction_id": data.transaction_id,
        "remarks": data.remarks,
        "paid_at": datetime.utcnow().isoformat(),
        "recorded_by": str(current_user["_id"])
    }

    await db.fees.update_one(
        {"_id": ObjectId(data.fee_id)},
        {
            "$set": {
                "amount_paid": new_paid,
                "due_amount": max(0, new_due),
                "status": new_status,
                "updated_at": datetime.utcnow()
            },
            "$push": {"payment_history": payment_record}
        }
    )

    updated_fee = await db.fees.find_one({"_id": ObjectId(data.fee_id)})
    student = await db.users.find_one({"_id": ObjectId(fee["student_id"])})
    if student and new_status == "paid":
        await create_notification(
            user_id=fee["student_id"],
            title="Fee Payment Confirmed",
            message=f"Your payment of ₹{data.amount_paid} has been received. Fee status: {new_status}.",
            notification_type="fee_reminder",
            send_email=True,
            email=student.get("email"),
            name=student.get("full_name")
        )
    return {"message": "Payment recorded", "fee": serialize_doc(updated_fee)}


@router.get("/{fee_id}/receipt")
async def download_receipt(fee_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    fee = await db.fees.find_one({"_id": ObjectId(fee_id)})
    if not fee:
        raise HTTPException(status_code=404, detail="Fee not found")
    student = await db.users.find_one({"_id": ObjectId(fee["student_id"])}, {"password": 0})

    pdf_bytes = generate_fee_receipt(serialize_doc(fee), serialize_doc(student))
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=fee_receipt_{fee_id}.pdf"}
    )


@router.get("/overdue/all")
async def get_overdue_fees(current_user=Depends(require_admin)):
    db = get_db()
    today = datetime.utcnow().isoformat()
    fees = await db.fees.find({
        "status": {"$in": ["pending", "partial"]},
        "due_date": {"$lt": today}
    }).to_list(500)
    return serialize_list(fees)
