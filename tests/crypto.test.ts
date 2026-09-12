import { CryptoService } from '../src/services/cryptoService';

describe('End-to-End Encryption (Curve25519 + XSalsa20-Poly1305)', () => {
  it('generates valid key pairs for User A and User B', () => {
    const userA = CryptoService.generateKeyPair();
    const userB = CryptoService.generateKeyPair();

    expect(userA.publicKey).toBeDefined();
    expect(userA.secretKey).toBeDefined();
    expect(userB.publicKey).toBeDefined();
    expect(userB.secretKey).toBeDefined();

    expect(userA.publicKey).not.toEqual(userB.publicKey);
  });

  it('encrypts plaintext so it does NOT appear in ciphertext payload', () => {
    const userA = CryptoService.generateKeyPair();
    const userB = CryptoService.generateKeyPair();

    const sensitiveMessage = 'I love you ❤️ Secret message 123';

    const payload = CryptoService.encryptMessage(
      sensitiveMessage,
      userB.publicKey,
      userA.secretKey,
      userA.publicKey
    );

    expect(payload.ciphertext).toBeDefined();
    expect(payload.nonce).toBeDefined();

    // MUST NOT reveal plaintext
    expect(payload.ciphertext).not.toContain('I love you');
    expect(payload.ciphertext).not.toContain('Secret message');
  });

  it('allows recipient (User B) to decrypt message correctly', () => {
    const userA = CryptoService.generateKeyPair();
    const userB = CryptoService.generateKeyPair();

    const sensitiveMessage = 'Meet me at 8 PM 🤫';

    const payload = CryptoService.encryptMessage(
      sensitiveMessage,
      userB.publicKey,
      userA.secretKey,
      userA.publicKey
    );

    const decrypted = CryptoService.decryptMessage(payload, userB.secretKey);
    expect(decrypted).toBe(sensitiveMessage);
  });

  it('fails decryption if an unauthorized user attempts to decrypt', () => {
    const userA = CryptoService.generateKeyPair();
    const userB = CryptoService.generateKeyPair();
    const attacker = CryptoService.generateKeyPair();

    const sensitiveMessage = 'Top secret coordinates';

    const payload = CryptoService.encryptMessage(
      sensitiveMessage,
      userB.publicKey,
      userA.secretKey,
      userA.publicKey
    );

    // Attacker attempts decryption with their secret key
    const decrypted = CryptoService.decryptMessage(payload, attacker.secretKey);
    expect(decrypted).toBeNull();
  });
});
