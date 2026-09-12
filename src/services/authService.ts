import { SecureStorage } from '../storage/secureStorage';
import { CryptoService } from './cryptoService';
import { BruteForceState } from '../types/auth';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30000; // 30 second lockout after 5 failures

export class AuthService {
  private static bruteForceState: BruteForceState = {
    attempts: 0,
  };

  /**
   * Initializes device identity and E2EE keys on first launch.
   */
  static async registerDevice(apiBaseUrl: string = 'http://localhost:8000'): Promise<{
    userId: string;
    deviceId: string;
    publicKey: string;
  }> {
    const existingSession = await SecureStorage.getDeviceSession();
    const keyPair = await CryptoService.getOrCreateKeyPair();

    if (existingSession) {
      return {
        userId: existingSession.userId,
        deviceId: existingSession.deviceId,
        publicKey: keyPair.publicKey,
      };
    }

    // Register with backend API
    const deviceName = 'CalculatorX Mobile Device';
    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_public_key: keyPair.publicKey,
          device_name: deviceName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await SecureStorage.saveDeviceSession({
          userId: data.user_id,
          deviceId: data.device_id,
        });
        return {
          userId: data.user_id,
          deviceId: data.device_id,
          publicKey: keyPair.publicKey,
        };
      }
    } catch (e) {
      console.warn('Backend offline, running in offline mode:', e);
    }

    // Local fallback IDs if backend offline
    const localUserId = 'user_' + Math.random().toString(36).slice(2, 10);
    const localDeviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
    await SecureStorage.saveDeviceSession({
      userId: localUserId,
      deviceId: localDeviceId,
    });

    return {
      userId: localUserId,
      deviceId: localDeviceId,
      publicKey: keyPair.publicKey,
    };
  }

  /**
   * Securely validates PIN against hashed store with brute-force prevention.
   */
  static async verifyPin(enteredPin: string): Promise<{
    success: boolean;
    lockedOut?: boolean;
    remainingLockoutSeconds?: number;
    errorMsg?: string;
  }> {
    const now = Date.now();
    if (
      this.bruteForceState.lockedUntil &&
      now < this.bruteForceState.lockedUntil
    ) {
      const remainingSec = Math.ceil(
        (this.bruteForceState.lockedUntil - now) / 1000
      );
      return {
        success: false,
        lockedOut: true,
        remainingLockoutSeconds: remainingSec,
        errorMsg: `Too many attempts. Please try again in ${remainingSec}s.`,
      };
    }

    const isValid = await SecureStorage.verifyPin(enteredPin);

    if (isValid) {
      this.bruteForceState = { attempts: 0 };
      return { success: true };
    }

    this.bruteForceState.attempts += 1;
    if (this.bruteForceState.attempts >= MAX_ATTEMPTS) {
      this.bruteForceState.lockedUntil = Date.now() + LOCKOUT_MS;
      return {
        success: false,
        lockedOut: true,
        remainingLockoutSeconds: LOCKOUT_MS / 1000,
        errorMsg: 'Please try again later.',
      };
    }

    return {
      success: false,
      errorMsg: 'Invalid input',
    };
  }
}
