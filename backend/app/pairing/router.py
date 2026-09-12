import random
import string
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.database import get_session
from app.models import Conversation, Device, User

router = APIRouter(prefix="/api/pairing", tags=["pairing"])

class CreatePairingRequest(BaseModel):
    device_id: str

class JoinPairingRequest(BaseModel):
    device_id: str
    pairing_code: str

def generate_code(length: int = 6) -> str:
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    return "".join(random.choice(chars) for _ in range(length))

@router.post("/create")
def create_pairing(req: CreatePairingRequest, session: Session = Depends(get_session)):
    device = session.get(Device, req.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    code = generate_code()
    conv = Conversation(participant_1=device.user_id, pairing_code=code)
    session.add(conv)
    session.commit()
    session.refresh(conv)

    return {"pairing_code": code, "conversation_id": conv.id}

@router.post("/join")
def join_pairing(req: JoinPairingRequest, session: Session = Depends(get_session)):
    device = session.get(Device, req.device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")

    code = req.pairing_code.upper()
    statement = select(Conversation).where(Conversation.pairing_code == code)
    conv = session.exec(statement).first()

    if not conv:
        raise HTTPException(status_code=404, detail="Invalid or expired pairing code")

    if conv.participant_2 is not None:
        raise HTTPException(status_code=400, detail="Conversation already paired with two users")

    if conv.participant_1 == device.user_id:
        raise HTTPException(status_code=400, detail="Cannot pair with yourself")

    conv.participant_2 = device.user_id
    conv.pairing_code = None  # Consume pairing code
    session.add(conv)
    session.commit()
    session.refresh(conv)

    # Fetch partner's device public key
    partner_device_statement = select(Device).where(Device.user_id == conv.participant_1)
    partner_device = session.exec(partner_device_statement).first()

    return {
        "conversation_id": conv.id,
        "partner_user_id": conv.participant_1,
        "partner_public_key": partner_device.device_public_key if partner_device else None,
    }
