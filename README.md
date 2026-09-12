# CalculatorX — Stealth Private Two-Person Messaging App

CalculatorX is a privacy-focused mobile application disguised as an ordinary, fully functional calculator. Behind a stealth **3-tap gesture** on a user-configured calculator button and a **secret PIN**, lies an end-to-end encrypted (E2EE) real-time 1-on-1 messaging platform built with React Native and FastAPI.

---

## 📸 Camouflage & Stealth Model

When CalculatorX opens, it looks and behaves **100% like a real calculator**:
- Addition, subtraction, multiplication, division, decimal math, percentage, negative numbers, backspace, and error handling.
- **NO visual indicators**: No lock icons, no secret chat buttons, no privacy branding, and no hidden tabs.
- **Access Sequence**: `Configured Calculator Button -> 3 Taps within 1.2s -> Neutral PIN Entry ("Enter Code") -> Private Chat`.

---

## 🛠 Technology Stack

### Mobile Client
- **React Native & TypeScript**: Cross-platform mobile foundation.
- **React Navigation**: Stack navigation for Calculator, Setup, Secret PIN, Pairing, Chat, and Settings.
- **React Native Gesture Handler & Reanimated**: Precision tap timing and UI transitions.
- **React Native Keychain**: Hardware-backed iOS Keychain / Android Keystore storage for PBKDF2 salt + PIN hashes and E2EE secret keys (never stored in plaintext or AsyncStorage).
- **TweetNaCl.js**: Pure JS implementation of Curve25519 (x25519) key exchange + XSalsa20-Poly1305 authenticated encryption.

### Backend
- **FastAPI**: Asynchronous Python framework with WebSocket support.
- **SQLModel / SQLAlchemy & PostgreSQL**: Relational database storing exclusively encrypted payloads (NO `plaintext_message` column).
- **WebSockets**: Real-time bidirectional message relaying, typing indicators, and delivery/read receipts.
- **Pytest & Jest**: Automated test coverage for math logic, 3-tap timing, E2EE encryption, and backend REST/WS APIs.

---

## 🔐 Cryptographic Architecture (Genuine E2EE)

```text
[ User A Device ]                             [ FastAPI Relay ]                            [ User B Device ]
       │                                              │                                            │
  "I love you ❤️"                                     │                                            │
       │                                              │                                            │
  Curve25519 Box Encrypt                              │                                            │
  (User B PubKey + User A PrivKey)                    │                                            │
       │                                              │                                            │
Encrypted Payload (Nonce + Ciphertext) ──────────────>│                                            │
                                           Relay Encrypted Payload ───────────────────────────────>│
                                                      │                                       Curve25519 Box Decrypt
                                                      │                                       (User A PubKey + User B PrivKey)
                                                      │                                            │
                                                      │                                       "I love you ❤️"
```

1. **Zero Plaintext Transmission**: Plaintext messages exist ONLY in RAM on User A and User B devices.
2. **Backend Blindness**: The backend database receives and relays ONLY `encrypted_payload` (nonce, ciphertext, sender public key).
3. **Key Storage**: Private keys are generated on-device and stored in iOS Keychain / Android Keystore with `WHEN_UNLOCKED_THIS_DEVICE_ONLY` accessibility flags.

---

## 🚀 Setup & Running Instructions

### 1. Prerequisites
- Node.js >= 18
- Python >= 3.10
- React Native CLI / Android Studio / Xcode

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# Run FastAPI backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Backend will start on `http://localhost:8000`. Test endpoint at `http://localhost:8000/`.

### 3. Mobile Client Setup
```bash
# In the root directory:
npm install

# Start Metro Bundler
npm start

# Run Android
npm run android

# Run iOS
npm run ios
```

---

## 🧪 Running Automated Tests

### Frontend Unit & Cryptography Tests (Jest)
Runs unit tests for calculator math, 3-tap gesture timing window, and E2EE encryption/decryption cycle:
```bash
npm test
```

### Backend API & WebSocket Tests (Pytest)
Runs Pytest suite for device registration, 2-user pairing limits, and encrypted message relaying:
```bash
cd backend
pytest
```

---

## ⚙️ Security Controls & Best Practices

1. **Zero Plaintext Storage**: Plaintext messages, PINs, and private keys are never stored in AsyncStorage, logs, or server databases.
2. **Brute-Force Protection**: Exponential backoff and 30-second lockout after 5 incorrect PIN attempts.
3. **Background Auto-Lock**: Automatically resets active screen to Calculator mode when the app is backgrounded.
4. **Push Notification Privacy**: Notifications display generic text `"New message"` by default, preventing preview leak on lockscreen.
5. **Strict 2-User Pairing**: Enforces exactly 1-on-1 private conversations per invitation code.
