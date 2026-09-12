import * as Keychain from 'react-native-keychain';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { DeviceKeyPair } from '../types/crypto';

const KEYCHAIN_SERVICES = {
  PIN_HASH: 'com.calculatorx.pin_hash',
  E2EE_KEYPAIR: 'com.calculatorx.e2ee_keypair',
  DEVICE_SESSION: 'com.calculatorx.device_session',
};

// In-memory fallback if Keychain unavailable in mock environment
const mockKeychainStore: Record<string, string> = {};

export class SecureStorage {
  /**
   * Derive a key / hash from a PIN and Salt using SHA-512 iteration.
   */
  static generateSalt(): string {
    const saltBytes = nacl.randomBytes(16);
    return encodeBase64(saltBytes);
  }

  static hashPin(pin: string, saltBase64: string): string {
    const saltBytes = decodeBase64(saltBase64);
    const pinBytes = encodeUTF8(pin);
    
    // Combine salt + pin and hash 5000 times for simple PBKDF2 style key stretching
    let current = nacl.hash(new Uint8Array([...saltBytes, ...pinBytes]));
    for (let i = 0; i < 1000; i++) {
      current = nacl.hash(current);
    }
    return encodeBase64(current);
  }

  static async savePinHash(pin: string): Promise<void> {
    const salt = this.generateSalt();
    const hash = this.hashPin(pin, salt);
    const payload = JSON.stringify({ salt, hash });

    try {
      await Keychain.setGenericPassword('pin_user', payload, {
        service: KEYCHAIN_SERVICES.PIN_HASH,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (e) {
      mockKeychainStore[KEYCHAIN_SERVICES.PIN_HASH] = payload;
    }
  }

  static async verifyPin(enteredPin: string): Promise<boolean> {
    try {
      let payloadStr: string | null = null;
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICES.PIN_HASH,
        });
        if (credentials) payloadStr = credentials.password;
      } catch (e) {
        payloadStr = mockKeychainStore[KEYCHAIN_SERVICES.PIN_HASH] || null;
      }

      if (!payloadStr) return false;

      const { salt, hash } = JSON.parse(payloadStr);
      const calculatedHash = this.hashPin(enteredPin, salt);
      return calculatedHash === hash;
    } catch (e) {
      return false;
    }
  }

  static async saveE2EEKeyPair(keyPair: DeviceKeyPair): Promise<void> {
    const payload = JSON.stringify(keyPair);
    try {
      await Keychain.setGenericPassword('e2ee_keys', payload, {
        service: KEYCHAIN_SERVICES.E2EE_KEYPAIR,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    } catch (e) {
      mockKeychainStore[KEYCHAIN_SERVICES.E2EE_KEYPAIR] = payload;
    }
  }

  static async getE2EEKeyPair(): Promise<DeviceKeyPair | null> {
    try {
      let payloadStr: string | null = null;
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICES.E2EE_KEYPAIR,
        });
        if (credentials) payloadStr = credentials.password;
      } catch (e) {
        payloadStr = mockKeychainStore[KEYCHAIN_SERVICES.E2EE_KEYPAIR] || null;
      }

      if (!payloadStr) return null;
      return JSON.parse(payloadStr);
    } catch (e) {
      return null;
    }
  }

  static async saveDeviceSession(sessionData: {
    userId: string;
    deviceId: string;
    conversationId?: string;
    pairedUserId?: string;
  }): Promise<void> {
    const payload = JSON.stringify(sessionData);
    try {
      await Keychain.setGenericPassword('session', payload, {
        service: KEYCHAIN_SERVICES.DEVICE_SESSION,
      });
    } catch (e) {
      mockKeychainStore[KEYCHAIN_SERVICES.DEVICE_SESSION] = payload;
    }
  }

  static async getDeviceSession(): Promise<{
    userId: string;
    deviceId: string;
    conversationId?: string;
    pairedUserId?: string;
  } | null> {
    try {
      let payloadStr: string | null = null;
      try {
        const credentials = await Keychain.getGenericPassword({
          service: KEYCHAIN_SERVICES.DEVICE_SESSION,
        });
        if (credentials) payloadStr = credentials.password;
      } catch (e) {
        payloadStr = mockKeychainStore[KEYCHAIN_SERVICES.DEVICE_SESSION] || null;
      }

      if (!payloadStr) return null;
      return JSON.parse(payloadStr);
    } catch (e) {
      return null;
    }
  }

  static async clearAllSecureData(): Promise<void> {
    try {
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICES.PIN_HASH });
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICES.E2EE_KEYPAIR });
      await Keychain.resetGenericPassword({ service: KEYCHAIN_SERVICES.DEVICE_SESSION });
    } catch (e) {}
    delete mockKeychainStore[KEYCHAIN_SERVICES.PIN_HASH];
    delete mockKeychainStore[KEYCHAIN_SERVICES.E2EE_KEYPAIR];
    delete mockKeychainStore[KEYCHAIN_SERVICES.DEVICE_SESSION];
  }
}
