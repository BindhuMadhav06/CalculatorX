import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.database import get_session
from app.models import Message, Conversation, Device

router = APIRouter(prefix="/api", tags=["chat"])

class SendMessageRequest(BaseModel):
    conversation_id: str
    sender_device_id: str
    sender_id: str
    encrypted_payload: dict  # Must contain nonce, ciphertext, senderPublicKey
    image_uri: Optional[str] = None
    reply_to_id: Optional[str] = None

@router.get("/conversations/{conversation_id}/messages")
def get_messages(
    conversation_id: str,
    device_id: str,
    limit: int = 50,
    session: Session = Depends(get_session),
):
    device = session.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    conv = session.get(Conversation, conversation_id)
    if not conv or (conv.participant_1 != device.user_id and conv.participant_2 != device.user_id):
        raise HTTPException(status_code=403, detail="Access denied")

    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    messages = session.exec(statement).all()
    
    # Return formatted payload with json loaded encrypted_payload
    result = []
    for msg in messages:
        payload_dict = json.loads(msg.encrypted_payload) if isinstance(msg.encrypted_payload, str) else msg.encrypted_payload
        result.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "sender_id": msg.sender_id,
            "encrypted_payload": payload_dict,
            "created_at": msg.created_at,
            "image_uri": msg.image_uri,
            "reply_to_id": msg.reply_to_id,
            "delivered_at": msg.delivered_at,
            "read_at": msg.read_at,
        })

    return result

@router.post("/messages")
def send_message(req: SendMessageRequest, session: Session = Depends(get_session)):
    conv = session.get(Conversation, req.conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # CRITICAL REQUIREMENT: Save ONLY encrypted payload, NO plaintext!
    msg = Message(
        conversation_id=req.conversation_id,
        sender_device_id=req.sender_device_id,
        sender_id=req.sender_id,
        encrypted_payload=json.dumps(req.encrypted_payload),
        image_uri=req.image_uri,
        reply_to_id=req.reply_to_id,
    )
    session.add(msg)
    session.commit()
    session.refresh(msg)

    return {"id": msg.id, "created_at": msg.created_at}
