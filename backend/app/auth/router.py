from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, Device

router = APIRouter(prefix="/api/auth", tags=["auth"])

class RegisterDeviceRequest(BaseModel):
    device_public_key: str
    device_name: str = "Mobile Device"

class RegisterDeviceResponse(BaseModel):
    user_id: str
    device_id: str
    device_public_key: str

@router.post("/register", response_model=RegisterDeviceResponse)
def register_device(req: RegisterDeviceRequest, session: Session = Depends(get_session)):
    user = User()
    session.add(user)
    session.commit()
    session.refresh(user)

    device = Device(
        user_id=user.id,
        device_public_key=req.device_public_key,
        device_name=req.device_name,
    )
    session.add(device)
    session.commit()
    session.refresh(device)

    return RegisterDeviceResponse(
        user_id=user.id,
        device_id=device.id,
        device_public_key=device.device_public_key,
    )

@router.get("/device/{device_id}")
def get_device(device_id: str, session: Session = Depends(get_session)):
    device = session.get(Device, device_id)
    if not device or device.revoked_at is not None:
        raise HTTPException(status_code=404, detail="Device not found or revoked")
    return device
