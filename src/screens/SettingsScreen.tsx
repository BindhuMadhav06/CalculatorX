import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  ScrollView,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PreferencesStorage } from '../storage/preferencesStorage';
import { NotificationService, NotificationSettings } from '../services/notificationService';
import { SecureStorage } from '../storage/secureStorage';

interface SettingsScreenProps {
  onBackToChat: () => void;
  onLockApp: () => void;
  onChangeUnlockSetup: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBackToChat,
  onLockApp,
  onChangeUnlockSetup,
}) => {
  const [autoLockMin, setAutoLockMin] = useState<number>(0);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings>(
    NotificationService.getSettings()
  );

  useEffect(() => {
    PreferencesStorage.getAutoLockMinutes().then(setAutoLockMin);
  }, []);

  const handleAutoLockChange = async (minutes: number) => {
    setAutoLockMin(minutes);
    await PreferencesStorage.setAutoLockMinutes(minutes);
  };

  const toggleNotification = (key: keyof NotificationSettings) => {
    const updated = { ...notifSettings, [key]: !notifSettings[key] };
    setNotifSettings(updated);
    NotificationService.updateSettings(updated);
  };

  const handleRevokeDevice = () => {
    Alert.alert(
      'Revoke Device Keys',
      'Are you sure you want to revoke this device? Your encryption keypair will be cleared.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Revoke',
          style: 'destructive',
          onPress: async () => {
            await SecureStorage.clearAllSecureData();
            onLockApp();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBackToChat} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Chat</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 80 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Security Section */}
        <Text style={styles.sectionHeader}>SECURITY</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.row} onPress={onChangeUnlockSetup}>
            <Text style={styles.rowLabel}>Change Secret Code & Trigger</Text>
            <Text style={styles.rowChevron}>›</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <Text style={[styles.rowLabel, { paddingHorizontal: 16, paddingTop: 12 }]}>
            Auto Lock Delay
          </Text>
          <View style={styles.optionsRow}>
            {[
              { label: 'Immediate', min: 0 },
              { label: '30s', min: 0.5 },
              { label: '1m', min: 1 },
              { label: '5m', min: 5 },
              { label: 'Never', min: -1 },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.label}
                style={[
                  styles.optionPill,
                  autoLockMin === opt.min && styles.optionPillActive,
                ]}
                onPress={() => handleAutoLockChange(opt.min)}
              >
                <Text
                  style={[
                    styles.optionPillText,
                    autoLockMin === opt.min && styles.optionPillActiveText,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.row} onPress={handleRevokeDevice}>
            <Text style={[styles.rowLabel, { color: '#FF453A' }]}>Revoke Device Keys</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>
        <View style={styles.sectionCard}>
          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Enable Notifications</Text>
            <Switch
              value={notifSettings.enabled}
              onValueChange={() => toggleNotification('enabled')}
              trackColor={{ true: '#30D158' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.rowLabel}>Custom Notification Alert</Text>
              <Text style={styles.rowSubtext}>
                Stealth notification text shown on lockscreen.
              </Text>
            </View>
          </View>
          <View style={{ paddingHorizontal: 16, pb: 12, paddingBottom: 12 }}>
            <TextInput
              style={styles.customAlertInput}
              value={notifSettings.customAlertText}
              onChangeText={(val) => {
                const updated = { ...notifSettings, customAlertText: val };
                setNotifSettings(updated);
                NotificationService.updateSettings(updated);
              }}
              placeholder="e.g. its MAD time"
              placeholderTextColor="#8E8E93"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.rowLabel}>Message Previews</Text>
              <Text style={styles.rowSubtext}>
                Default OFF. Keep OFF to hide sensitive text on lockscreen.
              </Text>
            </View>
            <Switch
              value={notifSettings.showPreviews}
              onValueChange={() => toggleNotification('showPreviews')}
              trackColor={{ true: '#30D158' }}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.switchRow}>
            <Text style={styles.rowLabel}>Sound</Text>
            <Switch
              value={notifSettings.sound}
              onValueChange={() => toggleNotification('sound')}
              trackColor={{ true: '#30D158' }}
            />
          </View>
        </View>

        {/* Account Section */}
        <Text style={styles.sectionHeader}>ACCOUNT</Text>
        <View style={styles.sectionCard}>
          <TouchableOpacity style={styles.row} onPress={onLockApp}>
            <Text style={[styles.rowLabel, { color: '#007AFF' }]}>Lock & Exit to Calculator</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    height: 56,
    backgroundColor: '#1C1C1E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButton: {
    width: 100,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 8,
    letterSpacing: 0.5,
  },
  sectionCard: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  rowSubtext: {
    color: '#8E8E93',
    fontSize: 12,
    marginTop: 2,
  },
  customAlertInput: {
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
    color: '#30D158',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  rowChevron: {
    color: '#8E8E93',
    fontSize: 20,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#2C2C2E',
  },
  optionsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    justifyContent: 'space-between',
  },
  optionPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#2C2C2E',
  },
  optionPillActive: {
    backgroundColor: '#007AFF',
  },
  optionPillText: {
    color: '#8E8E93',
    fontSize: 13,
  },
  optionPillActiveText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
