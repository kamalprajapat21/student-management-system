from bson import ObjectId
from datetime import datetime
import re
import secrets
import string


def serialize_doc(doc: dict) -> dict:
    """Convert MongoDB document to JSON-serializable dict."""
    if doc is None:
        return None
    result = {}
    for key, value in doc.items():
        if key == "_id":
            result["id"] = str(value)
        elif isinstance(value, ObjectId):
            result[key] = str(value)
        elif isinstance(value, datetime):
            result[key] = value.isoformat()
        elif isinstance(value, list):
            result[key] = [serialize_doc(v) if isinstance(v, dict) else str(v) if isinstance(v, ObjectId) else v for v in value]
        elif isinstance(value, dict):
            result[key] = serialize_doc(value)
        else:
            result[key] = value
    return result


def serialize_list(docs: list) -> list:
    return [serialize_doc(doc) for doc in docs]


def generate_reset_token(length: int = 32) -> str:
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def validate_email(email: str) -> bool:
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def calculate_attendance_percentage(present: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((present / total) * 100, 2)


def get_attendance_status(percentage: float) -> str:
    if percentage >= 75:
        return "Safe"
    elif percentage >= 60:
        return "Warning"
    else:
        return "Critical"


def paginate(page: int, limit: int) -> tuple:
    skip = (page - 1) * limit
    return skip, limit
