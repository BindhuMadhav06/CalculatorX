export interface DeviceKeyPair {
  publicKey: string; // Base64 Curve25519 public key
  secretKey: string; // Base64 Curve25519 secret key
}

export interface EncryptedPayload {
  nonce: string; // Base64 nonce
  ciphertext: string; // Base64 encrypted message
  senderPublicKey: string; // Base64 sender public key
  version: number; // Crypto version (1)
}

export interface DecryptedMessage {
  id: string;
  text: string;
  senderId: string;
  timestamp: number;
  imageUri?: string;
  replyToId?: string;
}
