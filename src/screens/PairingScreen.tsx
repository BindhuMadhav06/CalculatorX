import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { PairingService } from '../services/pairingService';
import { SecureStorage } from '../storage/secureStorage';
import { formatPairingCode } from '../utils/validation';

interface PairingScreenProps {
  onPairingComplete: () => void;
}

export const PairingScreen: React.FC<PairingScreenProps> = ({ onPairingComplete }) => {
  const [mode, setMode] = useState<'SHOW_CODE' | 'ENTER_CODE'>('SHOW_CODE');
  const [myPairingCode, setMyPairingCode] = useState<string>('');
  const [inputCode, setInputCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    initPairingCode();
  }, []);

  const initPairingCode = async () => {
    const session = await SecureStorage.getDeviceSession();
    const deviceId = session?.deviceId || 'dev_local';
    const result = await PairingService.createPairingCode(
      'https://calculatorx-backend.onrender.com',
      deviceId
    );
    setMyPairingCode(result.pairingCode);
  };

  const handleJoin = async () => {
    const formatted = formatPairingCode(inputCode);
    if (formatted.length < 6) {
      setErrorMsg('Code must be 6 characters');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const session = await SecureStorage.getDeviceSession();
    const deviceId = session?.deviceId || 'dev_local';

    const result = await PairingService.joinPairingCode(
      'https://calculatorx-backend.onrender.com',
      deviceId,
      formatted
    );

    setLoading(false);
    if (result.success) {
      onPairingComplete();
    } else {
      setErrorMsg(result.error || 'Pairing failed. Check code.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerTitle}>Pairing Setup</Text>
        <Text style={styles.subtitle}>
          CalculatorX supports exactly one private conversation between two paired users.
        </Text>

        {/* Mode Segment Switch */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[styles.segmentButton, mode === 'SHOW_CODE' && styles.segmentActive]}
            onPress={() => setMode('SHOW_CODE')}
          >
            <Text style={[styles.segmentText, mode === 'SHOW_CODE' && styles.segmentActiveText]}>
              My Code / QR
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.segmentButton, mode === 'ENTER_CODE' && styles.segmentActive]}
            onPress={() => setMode('ENTER_CODE')}
          >
            <Text style={[styles.segmentText, mode === 'ENTER_CODE' && styles.segmentActiveText]}>
              Enter Partner Code
            </Text>
          </TouchableOpacity>
        </View>

        {mode === 'SHOW_CODE' ? (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Share this code with your partner:</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{myPairingCode || 'LOADING...'}</Text>
            </View>

            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrText}>[ QR CODE PAYLOAD ]</Text>
              <Text style={styles.qrSubtext}>`calcx://pair?code={myPairingCode}`</Text>
            </View>

            <Text style={styles.infoText}>
              Once your partner enters or scans this code, your private 1-on-1 session will connect.
            </Text>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Enter partner's 6-character code:</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="e.g. A9X2KP"
              placeholderTextColor="#666666"
              value={inputCode}
              onChangeText={(t) => {
                setInputCode(t.toUpperCase());
                setErrorMsg('');
              }}
              maxLength={6}
              autoCapitalize="characters"
              autoCorrect={false}
            />

            {errorMsg ? <Text style={styles.errorText}>{errorMsg}</Text> : null}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleJoin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.submitButtonText}>Connect Partner</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 24,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#1C1C1E',
    borderRadius: 10,
    padding: 3,
    marginBottom: 24,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: '#2C2C2E',
  },
  segmentText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '500',
  },
  segmentActiveText: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  cardLabel: {
    color: '#EBEBF5',
    fontSize: 16,
    marginBottom: 16,
  },
  codeBox: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 30,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  codeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#30D158',
    letterSpacing: 4,
  },
  qrPlaceholder: {
    width: 180,
    height: 180,
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
    padding: 10,
  },
  qrText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  qrSubtext: {
    color: '#8E8E93',
    fontSize: 10,
    textAlign: 'center',
  },
  infoText: {
    color: '#8E8E93',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  codeInput: {
    backgroundColor: '#2C2C2E',
    width: '100%',
    height: 54,
    borderRadius: 12,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 3,
    marginBottom: 12,
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
