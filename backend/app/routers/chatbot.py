from fastapi import APIRouter, HTTPException, Depends
from app.utils.auth_deps import get_current_user
from app.utils.helpers import serialize_list
from app.database import get_db
from app.services.chatbot_service import process_chatbot_query
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


class ChatMessage(BaseModel):
    message: str
    conversation_id: str = None


@router.post("/chat")
async def chat(data: ChatMessage, current_user=Depends(get_current_user)):
    db = get_db()
    student_id = str(current_user["_id"])

    # Store user message
    conversation_id = data.conversation_id or f"{student_id}_{datetime.utcnow().timestamp()}"
    await db.chat_history.insert_one({
        "conversation_id": conversation_id,
        "user_id": student_id,
        "role": "user",
        "message": data.message,
        "timestamp": datetime.utcnow()
    })

    # Get response from chatbot service
    response = await process_chatbot_query(data.message, current_user, db)

    # Store bot response
    await db.chat_history.insert_one({
        "conversation_id": conversation_id,
        "user_id": student_id,
        "role": "assistant",
        "message": response,
        "timestamp": datetime.utcnow()
    })

    return {
        "response": response,
        "conversation_id": conversation_id
    }


@router.get("/history")
async def get_chat_history(
    conversation_id: str = None,
    current_user=Depends(get_current_user)
):
    db = get_db()
    query = {"user_id": str(current_user["_id"])}
    if conversation_id:
        query["conversation_id"] = conversation_id
    history = await db.chat_history.find(query).sort("timestamp", 1).to_list(100)
    return serialize_list(history)
