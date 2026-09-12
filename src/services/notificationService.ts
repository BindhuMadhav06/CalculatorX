export interface NotificationSettings {
  enabled: boolean;
  showPreviews: boolean;
  customAlertText: string; // e.g. "its MAD time"
  sound: boolean;
  vibration: boolean;
}

export class NotificationService {
  private static settings: NotificationSettings = {
    enabled: true,
    showPreviews: false,
    customAlertText: 'its MAD time', // Custom secret notification alert text
    sound: true,
    vibration: true,
  };

  static updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  static getSettings(): NotificationSettings {
    return this.settings;
  }

  /**
   * Triggers a push notification with custom alert text ("its MAD time").
   */
  static triggerMessageNotification(senderName: string = 'Partner', messageSnippet?: string) {
    if (!this.settings.enabled) return;

    const title = this.settings.customAlertText || 'its MAD time';
    const body = this.settings.showPreviews && messageSnippet
      ? messageSnippet
      : this.settings.customAlertText || 'its MAD time';

    console.log(`[PUSH NOTIFICATION] Title: "${title}" | Body: "${body}"`);
  }
}
