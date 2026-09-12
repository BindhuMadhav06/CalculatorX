import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { CalculatorButton } from '../components/CalculatorButton';
import { PinPad } from '../components/PinPad';
import { PreferencesStorage } from '../storage/preferencesStorage';
import { SecureStorage } from '../storage/secureStorage';
import { validatePin } from '../utils/validation';

interface SetupScreenProps {
  onComplete: () => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({ onComplete }) => {
  const [step, setStep] = useState<'SELECT_LOCATION' | 'CREATE_PIN' | 'CONFIRM_PIN'>('SELECT_LOCATION');
  const [selectedTargetButton, setSelectedTargetButton] = useState<string>('5');
  const [firstPin, setFirstPin] = useState<string>('');
  const [confirmPin, setConfirmPin] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const buttonsGrid = [
    ['AC', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  const handleLocationSelect = (label: string) => {
    setSelectedTargetButton(label);
  };

  const handleProceedToPin = () => {
    setStep('CREATE_PIN');
  };

  const handleFirstPinDigit = (digit: string) => {
    if (firstPin.length < 6) {
      const next = firstPin + digit;
      setFirstPin(next);
      if (next.length === 6) {
        setStep('CONFIRM_PIN');
      }
    }
  };

  const handleFirstPinDelete = () => {
    setFirstPin((prev) => prev.slice(0, -1));
  };

  const handleConfirmPinDigit = async (digit: string) => {
    if (confirmPin.length < 6) {
      const next = confirmPin + digit;
      setConfirmPin(next);
      if (next.length === 6) {
        if (next === firstPin) {
          // Success! Save PIN hash and unlock location
          await SecureStorage.savePinHash(next);
          await PreferencesStorage.saveUnlockConfig({
            targetButton: selectedTargetButton,
            pinLength: 6,
            tapWindowMs: 1200,
            autoLockMinutes: 0,
          });
          await PreferencesStorage.setSetupComplete(true);
          onComplete();
        } else {
          setErrorMessage("Codes don't match");
          setConfirmPin('');
        }
      }
    }
  };

  const handleConfirmPinDelete = () => {
    setConfirmPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  return (
    <SafeAreaView style={styles.container}>
      {step === 'SELECT_LOCATION' && (
        <View style={styles.stepContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.headerLogo}
          />
          <Text style={styles.title}>Choose your unlock location</Text>
          <Text style={styles.subtitle}>
            Tap the calculator area you want to use for unlocking.
          </Text>

          {/* Calculator Grid Preview */}
          <View style={styles.gridContainer}>
            {buttonsGrid.map((row, rIdx) => (
              <View key={rIdx} style={styles.row}>
                {row.map((btn) => (
                  <CalculatorButton
                    key={btn}
                    label={btn}
                    doubleWidth={btn === '0'}
                    type={
                      ['AC', '±', '%'].includes(btn)
                        ? 'function'
                        : ['÷', '×', '−', '+', '='].includes(btn)
                        ? 'operator'
                        : 'number'
                    }
                    isSelectedForUnlock={btn === selectedTargetButton}
                    onPress={handleLocationSelect}
                  />
                ))}
              </View>
            ))}
          </View>

          <Text style={styles.selectedNotice}>
            Selected trigger: Button <Text style={styles.highlight}>{selectedTargetButton}</Text>
          </Text>

          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleProceedToPin}
            activeOpacity={0.8}
          >
            <Text style={styles.confirmButtonText}>Continue</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'CREATE_PIN' && (
        <PinPad
          title="Create Secret Code"
          pin={firstPin}
          onDigitPress={handleFirstPinDigit}
          onDeletePress={handleFirstPinDelete}
        />
      )}

      {step === 'CONFIRM_PIN' && (
        <PinPad
          title="Confirm Secret Code"
          pin={confirmPin}
          errorMessage={errorMessage}
          onDigitPress={handleConfirmPinDigit}
          onDeletePress={handleConfirmPinDelete}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  stepContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 16,
  },
  gridContainer: {
    width: '100%',
    maxWidth: 340,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  selectedNotice: {
    color: '#EBEBF5',
    fontSize: 16,
    marginVertical: 12,
  },
  highlight: {
    color: '#30D158',
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
