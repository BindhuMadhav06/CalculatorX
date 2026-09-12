import {
  handleCalculatorInput,
  initialCalculatorState,
  performMath,
} from '../src/utils/calculator';

describe('Calculator Math Engine', () => {
  it('performs basic addition correctly', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '1');
    state = handleCalculatorInput(state, '2');
    state = handleCalculatorInput(state, '+');
    state = handleCalculatorInput(state, '3');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('15');
  });

  it('performs subtraction correctly', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '5');
    state = handleCalculatorInput(state, '0');
    state = handleCalculatorInput(state, '−');
    state = handleCalculatorInput(state, '1');
    state = handleCalculatorInput(state, '5');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('35');
  });

  it('performs multiplication correctly', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '7');
    state = handleCalculatorInput(state, '×');
    state = handleCalculatorInput(state, '8');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('56');
  });

  it('performs division correctly', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '8');
    state = handleCalculatorInput(state, '1');
    state = handleCalculatorInput(state, '÷');
    state = handleCalculatorInput(state, '9');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('9');
  });

  it('handles division by zero gracefully', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '9');
    state = handleCalculatorInput(state, '÷');
    state = handleCalculatorInput(state, '0');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('Error');
    expect(state.hasError).toBe(true);
  });

  it('handles decimal inputs', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '1');
    state = handleCalculatorInput(state, '.');
    state = handleCalculatorInput(state, '5');
    state = handleCalculatorInput(state, '+');
    state = handleCalculatorInput(state, '2');
    state = handleCalculatorInput(state, '.');
    state = handleCalculatorInput(state, '5');
    state = handleCalculatorInput(state, '=');
    expect(state.displayValue).toBe('4');
  });

  it('handles percentage calculation', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '5');
    state = handleCalculatorInput(state, '0');
    state = handleCalculatorInput(state, '%');
    expect(state.displayValue).toBe('0.5');
  });

  it('handles sign toggle (±)', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '4');
    state = handleCalculatorInput(state, '2');
    state = handleCalculatorInput(state, '±');
    expect(state.displayValue).toBe('-42');
    state = handleCalculatorInput(state, '±');
    expect(state.displayValue).toBe('42');
  });

  it('clears state on AC button', () => {
    let state = initialCalculatorState;
    state = handleCalculatorInput(state, '9');
    state = handleCalculatorInput(state, '+');
    state = handleCalculatorInput(state, 'AC');
    expect(state.displayValue).toBe('0');
    expect(state.equation).toBe('');
  });
});
