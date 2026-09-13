import * as SecureStore from 'expo-secure-store';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { DeviceKeyPair } from '../types/crypto';

const STORAGE_KEYS = {
  PIN_HASH: 'calculatorx_pin_hash',
  E2EE_KEYPAIR: 'calculatorx_e2ee_keypair',
  DEVICE_SESSION: 'calculatorx_device_session',
};

const mockKeychainStore: Record<string, string> = {};

export class SecureStorage {
  static generateSalt(): string {
    const saltBytes = nacl.randomBytes(16);
    return encodeBase64(saltBytes);
  }

  static hashPin(pin: string, saltBase64: string): string {
    const saltBytes = decodeBase64(saltBase64);
    const pinBytes = encodeUTF8(pin);

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
      await SecureStore.setItemAsync(STORAGE_KEYS.PIN_HASH, payload);
    } catch (e) {
      mockKeychainStore[STORAGE_KEYS.PIN_HASH] = payload;
    }
  }

  static async verifyPin(enteredPin: string): Promise<boolean> {
    try {
      let payloadStr: string | null = null;
      try {
        payloadStr = await SecureStore.getItemAsync(STORAGE_KEYS.PIN_HASH);
      } catch (e) {
        payloadStr = mockKeychainStore[STORAGE_KEYS.PIN_HASH] || null;
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
      await SecureStore.setItemAsync(STORAGE_KEYS.E2EE_KEYPAIR, payload);
    } catch (e) {
      mockKeychainStore[STORAGE_KEYS.E2EE_KEYPAIR] = payload;
    }
  }

  static async getE2EEKeyPair(): Promise<DeviceKeyPair | null> {
    try {
      let payloadStr: string | null = null;
      try {
        payloadStr = await SecureStore.getItemAsync(STORAGE_KEYS.E2EE_KEYPAIR);
      } catch (e) {
        payloadStr = mockKeychainStore[STORAGE_KEYS.E2EE_KEYPAIR] || null;
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
      await SecureStore.setItemAsync(STORAGE_KEYS.DEVICE_SESSION, payload);
    } catch (e) {
      mockKeychainStore[STORAGE_KEYS.DEVICE_SESSION] = payload;
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
        payloadStr = await SecureStore.getItemAsync(STORAGE_KEYS.DEVICE_SESSION);
      } catch (e) {
        payloadStr = mockKeychainStore[STORAGE_KEYS.DEVICE_SESSION] || null;
      }

      if (!payloadStr) return null;
      return JSON.parse(payloadStr);
    } catch (e) {
      return null;
    }
  }

  static async clearAllSecureData(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(STORAGE_KEYS.PIN_HASH);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.E2EE_KEYPAIR);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.DEVICE_SESSION);
    } catch (e) {}
    delete mockKeychainStore[STORAGE_KEYS.PIN_HASH];
    delete mockKeychainStore[STORAGE_KEYS.E2EE_KEYPAIR];
    delete mockKeychainStore[STORAGE_KEYS.DEVICE_SESSION];
  }
}
