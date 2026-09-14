import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface PinPadProps {
  pin: string;
  pinLength?: number;
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  title?: string;
  errorMessage?: string;
}

export const PinPad: React.FC<PinPadProps> = ({
  pin,
  pinLength = 6,
  onDigitPress,
  onDeletePress,
  title = 'Enter Code',
  errorMessage,
}) => {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {/* PIN Dots Indicator */}
      <View style={styles.dotsRow}>
        {Array.from({ length: pinLength }).map((_, index) => {
          const isFilled = index < pin.length;
          return (
            <View
              key={index}
              style={[styles.dot, isFilled ? styles.filledDot : styles.emptyDot]}
            />
          );
        })}
      </View>

      {/* Error Message */}
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : (
        <View style={{ height: 20 }} />
      )}

      {/* Numeric Keypad Grid */}
      <View style={styles.keypadGrid}>
        {digits.map((item, index) => {
          if (item === '') {
            return <View key={index} style={styles.keypadCell} />;
          }

          if (item === '⌫') {
            return (
              <TouchableOpacity
                key={index}
                style={styles.keypadCell}
                onPress={onDeletePress}
                activeOpacity={0.6}
              >
                <Text style={styles.actionText}>⌫</Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={index}
              style={styles.keypadCell}
              onPress={() => onDigitPress(item)}
              activeOpacity={0.6}
            >
              <Text style={styles.digitText}>{item}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 24,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 10,
  },
  filledDot: {
    backgroundColor: '#FFFFFF',
  },
  emptyDot: {
    borderWidth: 1.5,
    borderColor: '#666666',
    backgroundColor: 'transparent',
  },
  errorText: {
    color: '#FF453A',
    fontSize: 14,
    marginBottom: 8,
    height: 20,
  },
  keypadGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'center',
  },
  keypadCell: {
    width: 75,
    height: 75,
    borderRadius: 37.5,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  digitText: {
    fontSize: 28,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  actionText: {
    fontSize: 24,
    color: '#EBEBF5',
  },
});
