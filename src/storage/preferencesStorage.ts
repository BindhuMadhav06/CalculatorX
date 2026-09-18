import AsyncStorage from '@react-native-async-storage/async-storage';
import { UnlockConfig } from '../types/auth';

const KEYS = {
  UNLOCK_CONFIG: '@calc_unlock_config',
  AUTO_LOCK_MINUTES: '@calc_auto_lock',
  FIRST_LAUNCH_COMPLETE: '@calc_setup_complete',
  NOTIFICATIONS_ENABLED: '@calc_notif_enabled',
};

export const defaultUnlockConfig: UnlockConfig = {
  targetButton: '5',
  pinLength: 6,
  tapWindowMs: 1200,
  autoLockMinutes: 0, // 0 = immediate on background
};

export class PreferencesStorage {
  static async getUnlockConfig(): Promise<UnlockConfig> {
    try {
      const data = await AsyncStorage.getItem(KEYS.UNLOCK_CONFIG);
      if (data) {
        return { ...defaultUnlockConfig, ...JSON.parse(data) };
      }
    } catch (e) {
      console.warn('Failed to load unlock config:', e);
    }
    return defaultUnlockConfig;
  }

  static async saveUnlockConfig(config: UnlockConfig): Promise<void> {
    await AsyncStorage.setItem(KEYS.UNLOCK_CONFIG, JSON.stringify(config));
  }

  static async isSetupComplete(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.FIRST_LAUNCH_COMPLETE);
      return value === 'true';
    } catch (e) {
      return false;
    }
  }

  static async setSetupComplete(complete: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.FIRST_LAUNCH_COMPLETE, complete ? 'true' : 'false');
    } catch (e) {}
  }

  static async getAutoLockMinutes(): Promise<number> {
    try {
      const val = await AsyncStorage.getItem(KEYS.AUTO_LOCK_MINUTES);
      return val ? parseInt(val, 10) : 0;
    } catch (e) {
      return 0;
    }
  }

  static async setAutoLockMinutes(minutes: number): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.AUTO_LOCK_MINUTES, minutes.toString());
    } catch (e) {}
  }

  static async clearAllPreferences(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (e) {}
  }
}
