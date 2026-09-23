import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64, encodeUTF8 } from 'tweetnacl-util';
import { DeviceKeyPair } from '../types/crypto';

const STORAGE_KEYS = {
  PIN_HASH: 'calculatorx_pin_hash',
  E2EE_KEYPAIR: 'calculatorx_e2ee_keypair',
  DEVICE_SESSION: 'calculatorx_device_session',
};

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

  static async setItem(key: string, value: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (e) {
      try {
        await AsyncStorage.setItem(key, value);
      } catch (err) {}
    }
  }

  static async getItem(key: string): Promise<string | null> {
    try {
      const val = await SecureStore.getItemAsync(key);
      if (val !== null) return val;
    } catch (e) {}
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  static async deleteItem(key: string): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch (e) {}
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {}
  }

  static async savePinHash(pin: string): Promise<void> {
    const salt = this.generateSalt();
    const hash = this.hashPin(pin, salt);
    const payload = JSON.stringify({ salt, hash });
    await this.setItem(STORAGE_KEYS.PIN_HASH, payload);
  }

  static async verifyPin(enteredPin: string): Promise<boolean> {
    try {
      const payloadStr = await this.getItem(STORAGE_KEYS.PIN_HASH);
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
    await this.setItem(STORAGE_KEYS.E2EE_KEYPAIR, payload);
  }

  static async getE2EEKeyPair(): Promise<DeviceKeyPair | null> {
    try {
      const payloadStr = await this.getItem(STORAGE_KEYS.E2EE_KEYPAIR);
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
    await this.setItem(STORAGE_KEYS.DEVICE_SESSION, payload);
  }

  static async getDeviceSession(): Promise<{
    userId: string;
    deviceId: string;
    conversationId?: string;
    pairedUserId?: string;
  } | null> {
    try {
      const payloadStr = await this.getItem(STORAGE_KEYS.DEVICE_SESSION);
      if (!payloadStr) return null;
      return JSON.parse(payloadStr);
    } catch (e) {
      return null;
    }
  }

  static async clearAllSecureData(): Promise<void> {
    await this.deleteItem(STORAGE_KEYS.PIN_HASH);
    await this.deleteItem(STORAGE_KEYS.E2EE_KEYPAIR);
    await this.deleteItem(STORAGE_KEYS.DEVICE_SESSION);
  }
}
