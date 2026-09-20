import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PinPad } from '../components/PinPad';
import { AuthService } from '../services/authService';

interface SecretCodeScreenProps {
  onAuthenticated: () => void;
  onCancel: () => void;
}

export const SecretCodeScreen: React.FC<SecretCodeScreenProps> = ({
  onAuthenticated,
  onCancel,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleDigitPress = async (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);

      if (nextPin.length === 6) {
        const result = await AuthService.verifyPin(nextPin);
        if (result.success) {
          setPin('');
          setErrorMessage('');
          onAuthenticated();
        } else {
          setErrorMessage(result.errorMsg || 'Invalid input');
          setPin('');
        }
      }
    }
  };

  const handleDeletePress = () => {
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onCancel} style={styles.backButton}>
          <Text style={styles.backButtonText}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <PinPad
          title="Enter Code"
          pin={pin}
          errorMessage={errorMessage}
          onDigitPress={handleDigitPress}
          onDeletePress={handleDeletePress}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#8E8E93',
    fontSize: 22,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
