import json
import time
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlmodel import Session, select
from app.database import get_session, engine
from app.models import Conversation, Message, Device
from app.websocket.manager import manager

router = APIRouter(tags=["websocket"])

@router.websocket("/ws/{device_id}")
async def websocket_endpoint(websocket: WebSocket, device_id: str):
    await manager.connect(device_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            event = json.loads(data)
            event_type = event.get("type")
            payload = event.get("payload", {})

            with Session(engine) as session:
                if event_type == "ping":
                    await manager.send_personal_message(
                        {"type": "pong", "payload": {"timestamp": time.time()}}, device_id
                    )

                elif event_type == "message":
                    conversation_id = payload.get("conversation_id")
                    conv = session.get(Conversation, conversation_id) if conversation_id else None

                    # Persist encrypted payload in DB
                    msg = Message(
                        conversation_id=conversation_id or "conv_default",
                        sender_device_id=device_id,
                        sender_id=payload.get("sender_id", "user_unknown"),
                        encrypted_payload=json.dumps(payload.get("encrypted_payload")),
                        image_uri=payload.get("image_uri"),
                        reply_to_id=payload.get("reply_to_id"),
                    )
                    session.add(msg)
                    session.commit()
                    session.refresh(msg)

                    # Send delivery ACK back to sender
                    await manager.send_personal_message(
                        {
                            "type": "delivery_ack",
                            "payload": {"message_id": payload.get("id"), "conversation_id": conversation_id},
                        },
                        device_id,
                    )

                    # Relay to partner devices in conversation if active
                    if conv:
                        target_user = (
                            conv.participant_2
                            if conv.participant_1 == payload.get("sender_id")
                            else conv.participant_1
                        )
                        if target_user:
                            partner_devices = session.exec(
                                select(Device).where(Device.user_id == target_user)
                            ).all()
                            partner_dev_ids = [d.id for d in partner_devices]
                            await manager.broadcast_to_devices(
                                {
                                    "type": "message",
                                    "payload": {
                                        "id": msg.id,
                                        "conversation_id": msg.conversation_id,
                                        "sender_id": msg.sender_id,
                                        "encrypted_payload": payload.get("encrypted_payload"),
                                        "image_uri": msg.image_uri,
                                        "reply_to_id": msg.reply_to_id,
                                        "created_at": msg.created_at,
                                    },
                                },
                                partner_dev_ids,
                            )
                    else:
                        # Relay to all other connected devices for local testing broadcast
                        other_devices = [d for d in manager.active_connections.keys() if d != device_id]
                        await manager.broadcast_to_devices(
                            {
                                "type": "message",
                                "payload": {
                                    "id": msg.id,
                                    "conversation_id": msg.conversation_id,
                                    "sender_id": msg.sender_id,
                                    "encrypted_payload": payload.get("encrypted_payload"),
                                    "image_uri": msg.image_uri,
                                    "reply_to_id": msg.reply_to_id,
                                    "created_at": msg.created_at,
                                },
                            },
                            other_devices,
                        )

                elif event_type in ["typing", "read_ack"]:
                    other_devices = [d for d in manager.active_connections.keys() if d != device_id]
                    await manager.broadcast_to_devices(
                        {"type": event_type, "payload": payload}, other_devices
                    )

    except WebSocketDisconnect:
        manager.disconnect(device_id)
