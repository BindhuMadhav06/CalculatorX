import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CalculatorDisplay } from '../components/CalculatorDisplay';
import { CalculatorButton } from '../components/CalculatorButton';
import {
  handleCalculatorInput,
  initialCalculatorState,
  CalculatorState,
} from '../utils/calculator';
import { useTripleTap } from '../hooks/useTripleTap';
import { PreferencesStorage } from '../storage/preferencesStorage';

interface CalculatorScreenProps {
  onTriggerUnlock: () => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({ onTriggerUnlock }) => {
  const [calcState, setCalcState] = useState<CalculatorState>(initialCalculatorState);
  const [targetButton, setTargetButton] = useState<string>('5');
  const [tapWindowMs, setTapWindowMs] = useState<number>(1200);

  useEffect(() => {
    PreferencesStorage.getUnlockConfig().then((cfg) => {
      setTargetButton(cfg.targetButton);
      setTapWindowMs(cfg.tapWindowMs);
    });
  }, []);

  const { handleButtonTap: processTripleTap } = useTripleTap({
    targetButton,
    tapWindowMs,
    onTripleTapSuccess: onTriggerUnlock,
  });

  const handlePress = (buttonLabel: string) => {
    // Process math logic
    setCalcState((prev) => handleCalculatorInput(prev, buttonLabel));

    // Secretly process 3-tap gesture logic simultaneously
    processTripleTap(buttonLabel);
  };

  const [isScientific, setIsScientific] = useState<boolean>(false);

  const scientificRow = ['sin', 'cos', 'tan', '√', 'π', 'ln'];

  const standardGrid = [
    ['AC', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '−'],
    ['1', '2', '3', '+'],
    ['0', '.', '='],
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <CalculatorDisplay
        equation={calcState.equation}
        displayValue={calcState.displayValue}
        hasError={calcState.hasError}
      />

      <View style={styles.gridContainer}>
        {/* Mode Bar */}
        <View style={styles.modeBar}>
          <CalculatorButton
            label={isScientific ? 'Standard' : 'Scientific'}
            onPress={() => setIsScientific(!isScientific)}
            type="function"
          />
        </View>

        {isScientific && (
          <View style={styles.row}>
            {scientificRow.map((btn) => (
              <CalculatorButton
                key={btn}
                label={btn}
                type="function"
                onPress={handlePress}
              />
            ))}
          </View>
        )}

        {standardGrid.map((row, rIdx) => (
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
                onPress={handlePress}
              />
            ))}
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'space-between',
  },
  gridContainer: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  modeBar: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
