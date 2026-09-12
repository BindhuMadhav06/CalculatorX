import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface CalculatorButtonProps {
  label: string;
  onPress: (label: string) => void;
  type?: 'number' | 'operator' | 'function' | 'equals';
  doubleWidth?: boolean;
  isSelectedForUnlock?: boolean;
}

export const CalculatorButton: React.FC<CalculatorButtonProps> = ({
  label,
  onPress,
  type = 'number',
  doubleWidth = false,
  isSelectedForUnlock = false,
}) => {
  const getButtonStyle = (): ViewStyle[] => {
    const base: ViewStyle[] = [styles.button];
    if (doubleWidth) base.push(styles.doubleWidth);

    switch (type) {
      case 'function':
        base.push(styles.functionButton);
        break;
      case 'operator':
      case 'equals':
        base.push(styles.operatorButton);
        break;
      default:
        base.push(styles.numberButton);
        break;
    }

    if (isSelectedForUnlock) {
      base.push(styles.selectedUnlockButton);
    }

    return base;
  };

  const getTextStyle = (): TextStyle[] => {
    const base: TextStyle[] = [styles.buttonText];
    if (type === 'function') base.push(styles.functionText);
    if (type === 'operator' || type === 'equals') base.push(styles.operatorText);
    return base;
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      activeOpacity={0.7}
      onPress={() => onPress(label)}
    >
      <Text style={getTextStyle()}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 6,
  },
  doubleWidth: {
    flex: 2,
    aspectRatio: 2.1,
    borderRadius: 50,
    alignItems: 'flex-start',
    paddingLeft: 30,
  },
  numberButton: {
    backgroundColor: '#333333',
  },
  functionButton: {
    backgroundColor: '#A5A5A5',
  },
  operatorButton: {
    backgroundColor: '#FF9F0A',
  },
  selectedUnlockButton: {
    borderWidth: 3,
    borderColor: '#30D158',
  },
  buttonText: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '400',
    fontFamily: 'System',
  },
  functionText: {
    color: '#000000',
  },
  operatorText: {
    color: '#FFFFFF',
    fontSize: 32,
  },
});
