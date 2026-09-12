export type AppMode = 'SETUP' | 'CALCULATOR' | 'PIN_ENTRY' | 'CHAT' | 'PAIRING' | 'SETTINGS';

export interface UnlockConfig {
  targetButton: string; // e.g. "5", "%", "AC"
  pinLength: number; // default 6
  tapWindowMs: number; // default 1200ms
  autoLockMinutes: number; // 0 = immediate, -1 = never
}

export interface UserSession {
  userId: string;
  deviceId: string;
  deviceName: string;
  isPaired: boolean;
  pairedUserId?: string;
  conversationId?: string;
}

export interface BruteForceState {
  attempts: number;
  lockedUntil?: number; // timestamp
}
