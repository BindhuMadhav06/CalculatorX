import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { DeviceKeyPair, EncryptedPayload } from '../types/crypto';
import { SecureStorage } from '../storage/secureStorage';

export class CryptoService {
  private static encoder = new TextEncoder();
  private static decoder = new TextDecoder();

  /**
   * Generates a new Curve25519 keypair for E2EE box encryption.
   */
  static generateKeyPair(): DeviceKeyPair {
    const pair = nacl.box.keyPair();
    return {
      publicKey: encodeBase64(pair.publicKey),
      secretKey: encodeBase64(pair.secretKey),
    };
  }

  /**
   * Retrieves existing device E2EE keypair or generates & securely stores a new one.
   */
  static async getOrCreateKeyPair(): Promise<DeviceKeyPair> {
    let pair = await SecureStorage.getE2EEKeyPair();
    if (!pair) {
      pair = this.generateKeyPair();
      await SecureStorage.saveE2EEKeyPair(pair);
    }
    return pair;
  }

  /**
   * Encrypts a plaintext message for a specific recipient.
   * Sender device private key + Recipient device public key -> Encrypted ciphertext.
   */
  static encryptMessage(
    plaintext: string,
    recipientPublicKeyBase64: string,
    senderSecretKeyBase64: string,
    senderPublicKeyBase64: string
  ): EncryptedPayload {
    const messageBytes = this.encoder.encode(plaintext);
    const nonce = new Uint8Array(nacl.randomBytes(nacl.box.nonceLength));
    const recipientPubKey = new Uint8Array(decodeBase64(recipientPublicKeyBase64));
    const senderSecretKey = new Uint8Array(decodeBase64(senderSecretKeyBase64));

    const ciphertext = nacl.box(
      messageBytes,
      nonce,
      recipientPubKey,
      senderSecretKey
    );

    if (!ciphertext) {
      throw new Error('Encryption failed');
    }

    return {
      nonce: encodeBase64(nonce),
      ciphertext: encodeBase64(ciphertext),
      senderPublicKey: senderPublicKeyBase64,
      version: 1,
    };
  }

  /**
   * Decrypts an incoming encrypted message payload.
   * Ciphertext + Recipient private key + Sender public key -> Plaintext string.
   */
  static decryptMessage(
    payload: EncryptedPayload,
    recipientSecretKeyBase64: string
  ): string | null {
    try {
      const ciphertext = new Uint8Array(decodeBase64(payload.ciphertext));
      const nonce = new Uint8Array(decodeBase64(payload.nonce));
      const senderPublicKey = new Uint8Array(decodeBase64(payload.senderPublicKey));
      const recipientSecretKey = new Uint8Array(decodeBase64(recipientSecretKeyBase64));

      const decryptedBytes = nacl.box.open(
        ciphertext,
        nonce,
        senderPublicKey,
        recipientSecretKey
      );

      if (!decryptedBytes) {
        return null;
      }

      return this.decoder.decode(decryptedBytes);
    } catch (e) {
      console.warn('E2EE Decryption error:', e);
      return null;
    }
  }
}
