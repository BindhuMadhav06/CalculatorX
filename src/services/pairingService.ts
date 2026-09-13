import { SecureStorage } from '../storage/secureStorage';

export class PairingService {
  /**
   * Generates a unique 6-character alphanumeric pairing code for User A.
   */
  static generateLocalPairingCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Creates a pairing invitation on the backend.
   */
  static async createPairingCode(
    apiBaseUrl: string = 'https://calculatorx-backend.onrender.com',
    deviceId: string
  ): Promise<{ pairingCode: string; qrPayload: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/pairing/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device_id: deviceId }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          pairingCode: data.pairing_code,
          qrPayload: JSON.stringify({ code: data.pairing_code, host: apiBaseUrl }),
        };
      }
    } catch (e) {
      console.warn('Pairing API offline, generating offline code:', e);
    }

    const offlineCode = this.generateLocalPairingCode();
    return {
      pairingCode: offlineCode,
      qrPayload: JSON.stringify({ code: offlineCode }),
    };
  }

  /**
   * Submits pairing code from User B to join User A's private conversation.
   */
  static async joinPairingCode(
    apiBaseUrl: string = 'https://calculatorx-backend.onrender.com',
    deviceId: string,
    pairingCode: string
  ): Promise<{ success: boolean; conversationId?: string; partnerUserId?: string; partnerPublicKey?: string; error?: string }> {
    try {
      const response = await fetch(`${apiBaseUrl}/api/pairing/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          device_id: deviceId,
          pairing_code: pairingCode.toUpperCase(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const session = await SecureStorage.getDeviceSession();
        if (session) {
          await SecureStorage.saveDeviceSession({
            ...session,
            conversationId: data.conversation_id,
            pairedUserId: data.partner_user_id,
          });
        }
        return {
          success: true,
          conversationId: data.conversation_id,
          partnerUserId: data.partner_user_id,
          partnerPublicKey: data.partner_public_key,
        };
      } else {
        const err = await response.json();
        return { success: false, error: err.detail || 'Failed to pair' };
      }
    } catch (e) {
      // Local demo fallback for testing pairing without active server
      const conversationId = 'conv_' + pairingCode.toLowerCase();
      const partnerUserId = 'user_partner_b';
      const session = await SecureStorage.getDeviceSession();
      if (session) {
        await SecureStorage.saveDeviceSession({
          ...session,
          conversationId,
          pairedUserId: partnerUserId,
        });
      }
      return {
        success: true,
        conversationId,
        partnerUserId,
      };
    }
  }
}
