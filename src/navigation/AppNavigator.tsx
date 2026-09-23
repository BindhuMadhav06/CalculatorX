import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SetupScreen } from '../screens/SetupScreen';
import { CalculatorScreen } from '../screens/CalculatorScreen';
import { SecretCodeScreen } from '../screens/SecretCodeScreen';
import { PairingScreen } from '../screens/PairingScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PreferencesStorage } from '../storage/preferencesStorage';
import { SecureStorage } from '../storage/secureStorage';
import { useAutoLock } from '../hooks/useAutoLock';
import { AppMode } from '../types/auth';

export const AppNavigator: React.FC = () => {
  const [appMode, setAppMode] = useState<AppMode>('CALCULATOR');
  const [isPaired, setIsPaired] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [partnerUserId, setPartnerUserId] = useState<string | undefined>();
  const [autoLockMin, setAutoLockMin] = useState<number>(0);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    try {
      const isSetup = await PreferencesStorage.isSetupComplete();
      if (!isSetup) {
        // Automatically set default PIN '123456' and target button '5'
        await SecureStorage.savePinHash('123456');
        await PreferencesStorage.saveUnlockConfig({
          targetButton: '5',
          pinLength: 6,
          tapWindowMs: 1200,
          autoLockMinutes: 0,
        });
        await PreferencesStorage.setSetupComplete(true);
      }

      setAppMode('CALCULATOR');

      const autoLock = await PreferencesStorage.getAutoLockMinutes();
      setAutoLockMin(autoLock);

      const session = await SecureStorage.getDeviceSession();
      if (session && session.conversationId) {
        setIsPaired(true);
        setConversationId(session.conversationId);
        setPartnerUserId(session.pairedUserId);
      }
    } catch (e) {
      console.warn('App initialization warning:', e);
      setAppMode('CALCULATOR');
    }
  };

  const handleLock = () => {
    setAppMode('CALCULATOR');
  };

  // Background Auto-lock trigger
  useAutoLock({
    autoLockMinutes: autoLockMin,
    isUnlocked: appMode === 'CHAT' || appMode === 'PAIRING' || appMode === 'SETTINGS',
    onLock: handleLock,
  });

  const handleSetupComplete = () => {
    setAppMode('CALCULATOR');
  };

  const handleTriggerUnlock = () => {
    setAppMode('PIN_ENTRY');
  };

  const handleAuthenticated = () => {
    if (isPaired) {
      setAppMode('CHAT');
    } else {
      setAppMode('PAIRING');
    }
  };

  const handlePairingComplete = async () => {
    const session = await SecureStorage.getDeviceSession();
    if (session) {
      setIsPaired(true);
      setConversationId(session.conversationId);
      setPartnerUserId(session.pairedUserId);
    }
    setAppMode('CHAT');
  };

  return (
    <View style={styles.container}>
      {appMode === 'SETUP' && <SetupScreen onComplete={handleSetupComplete} />}

      {appMode === 'CALCULATOR' && (
        <CalculatorScreen onTriggerUnlock={handleTriggerUnlock} />
      )}

      {appMode === 'PIN_ENTRY' && (
        <SecretCodeScreen
          onAuthenticated={handleAuthenticated}
          onCancel={handleLock}
        />
      )}

      {appMode === 'PAIRING' && (
        <PairingScreen onPairingComplete={handlePairingComplete} />
      )}

      {appMode === 'CHAT' && (
        <ChatScreen
          conversationId={conversationId}
          partnerUserId={partnerUserId}
          onOpenSettings={() => setAppMode('SETTINGS')}
          onLockApp={handleLock}
        />
      )}

      {appMode === 'SETTINGS' && (
        <SettingsScreen
          onBackToChat={() => setAppMode('CHAT')}
          onLockApp={handleLock}
          onChangeUnlockSetup={() => setAppMode('SETUP')}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
