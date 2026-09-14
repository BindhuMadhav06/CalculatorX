import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface CalculatorDisplayProps {
  equation: string;
  displayValue: string;
  hasError?: boolean;
}

export const CalculatorDisplay: React.FC<CalculatorDisplayProps> = ({
  equation,
  displayValue,
  hasError = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.equationText} numberOfLines={1} adjustsFontSizeToFit>
        {equation}
      </Text>
      <Text
        style={[styles.displayText, hasError && styles.errorText]}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {displayValue}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    minHeight: 160,
    backgroundColor: '#1C1C1E',
  },
  equationText: {
    color: '#8E8E93',
    fontSize: 22,
    marginBottom: 8,
  },
  displayText: {
    color: '#FFFFFF',
    fontSize: 54,
    fontWeight: '300',
  },
  errorText: {
    color: '#FF453A',
  },
});
