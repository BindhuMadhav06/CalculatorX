import json
from typing import Dict
from fastapi import WebSocket

class ConnectionManager:
    def __init__(self):
        # Map device_id -> active WebSocket connection
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, device_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[device_id] = websocket

    def disconnect(self, device_id: str):
        if device_id in self.active_connections:
            del self.active_connections[device_id]

    async def send_personal_message(self, message: dict, device_id: str):
        if device_id in self.active_connections:
            websocket = self.active_connections[device_id]
            await websocket.send_text(json.dumps(message))

    async def broadcast_to_devices(self, message: dict, target_device_ids: list):
        payload_str = json.dumps(message)
        for dev_id in target_device_ids:
            if dev_id in self.active_connections:
                await self.active_connections[dev_id].send_text(payload_str)

manager = ConnectionManager()
