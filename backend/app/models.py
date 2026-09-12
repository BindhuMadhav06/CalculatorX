import time
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class User(SQLModel, table=True):
    __tablename__ = "users"
    id: str = Field(default_factory=lambda: f"usr_{uuid.uuid4().hex[:10]}", primary_key=True)
    created_at: float = Field(default_factory=time.time)

class Device(SQLModel, table=True):
    __tablename__ = "devices"
    id: str = Field(default_factory=lambda: f"dev_{uuid.uuid4().hex[:10]}", primary_key=True)
    user_id: str = Field(index=True)
    device_public_key: str
    device_name: str = "Mobile Device"
    last_seen: float = Field(default_factory=time.time)
    created_at: float = Field(default_factory=time.time)
    revoked_at: Optional[float] = None

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    id: str = Field(default_factory=lambda: f"conv_{uuid.uuid4().hex[:10]}", primary_key=True)
    participant_1: str = Field(index=True)
    participant_2: Optional[str] = Field(default=None, index=True)
    pairing_code: Optional[str] = Field(default=None, index=True)
    created_at: float = Field(default_factory=time.time)

class Message(SQLModel, table=True):
    __tablename__ = "messages"
    id: str = Field(default_factory=lambda: f"msg_{uuid.uuid4().hex[:10]}", primary_key=True)
    conversation_id: str = Field(index=True)
    sender_device_id: str
    sender_id: str
    encrypted_payload: str  # JSON serialized EncryptedPayload (nonce, ciphertext, senderPublicKey)
    encryption_version: int = 1
    image_uri: Optional[str] = None
    reply_to_id: Optional[str] = None
    created_at: float = Field(default_factory=time.time)
    delivered_at: Optional[float] = None
    read_at: Optional[float] = None
