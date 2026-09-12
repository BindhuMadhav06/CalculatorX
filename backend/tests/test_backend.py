import pytest
import json
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.pool import StaticPool

from app.main import app
from app.database import get_session

# Setup in-memory SQLite for pytest
engine = create_engine(
    "sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool
)

def override_get_session():
    with Session(engine) as session:
        yield session

app.dependency_overrides[get_session] = override_get_session
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    SQLModel.metadata.create_all(engine)
    yield
    SQLModel.metadata.drop_all(engine)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["e2ee"] is True

def test_device_registration():
    response = client.post(
        "/api/auth/register",
        json={"device_public_key": "base64_pub_key_123", "device_name": "Test iPhone"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "user_id" in data
    assert "device_id" in data
    assert data["device_public_key"] == "base64_pub_key_123"

def test_pairing_workflow_and_two_user_limit():
    # 1. Register User A
    dev_a = client.post(
        "/api/auth/register",
        json={"device_public_key": "pub_a", "device_name": "Device A"},
    ).json()

    # 2. Register User B
    dev_b = client.post(
        "/api/auth/register",
        json={"device_public_key": "pub_b", "device_name": "Device B"},
    ).json()

    # 3. Register User C
    dev_c = client.post(
        "/api/auth/register",
        json={"device_public_key": "pub_c", "device_name": "Device C"},
    ).json()

    # 4. User A creates pairing code
    pair_res = client.post("/api/pairing/create", json={"device_id": dev_a["device_id"]}).json()
    pairing_code = pair_res["pairing_code"]
    assert len(pairing_code) == 6

    # 5. User B joins pairing code
    join_b = client.post(
        "/api/pairing/join",
        json={"device_id": dev_b["device_id"], "pairing_code": pairing_code},
    )
    assert join_b.status_code == 200
    conv_id = join_b.json()["conversation_id"]

    # 6. User C attempts to join same pairing code -> MUST fail with 404/400 (already paired or code consumed)
    join_c = client.post(
        "/api/pairing/join",
        json={"device_id": dev_c["device_id"], "pairing_code": pairing_code},
    )
    assert join_c.status_code in [400, 404]

def test_encrypted_message_flow():
    # Register devices
    dev_a = client.post(
        "/api/auth/register", json={"device_public_key": "pub_a", "device_name": "Device A"}
    ).json()
    dev_b = client.post(
        "/api/auth/register", json={"device_public_key": "pub_b", "device_name": "Device B"}
    ).json()

    pair_res = client.post("/api/pairing/create", json={"device_id": dev_a["device_id"]}).json()
    join_res = client.post(
        "/api/pairing/join",
        json={"device_id": dev_b["device_id"], "pairing_code": pair_res["pairing_code"]},
    ).json()
    conv_id = join_res["conversation_id"]

    # Send encrypted message payload
    encrypted_payload = {
        "nonce": "base64_nonce_999",
        "ciphertext": "base64_encrypted_ciphertext_xyz",
        "senderPublicKey": "pub_a",
        "version": 1,
    }

    send_res = client.post(
        "/api/messages",
        json={
            "conversation_id": conv_id,
            "sender_device_id": dev_a["device_id"],
            "sender_id": dev_a["user_id"],
            "encrypted_payload": encrypted_payload,
        },
    )
    assert send_res.status_code == 200
    msg_id = send_res.json()["id"]

    # Fetch messages for User B
    fetch_res = client.get(
        f"/api/conversations/{conv_id}/messages?device_id={dev_b['device_id']}"
    )
    assert fetch_res.status_code == 200
    messages = fetch_res.json()
    assert len(messages) == 1
    assert messages[0]["id"] == msg_id
    assert messages[0]["encrypted_payload"]["ciphertext"] == "base64_encrypted_ciphertext_xyz"
