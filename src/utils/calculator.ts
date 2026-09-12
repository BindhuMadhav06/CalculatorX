export interface CalculatorState {
  displayValue: string;
  equation: string;
  previousOperand: number | null;
  currentOperand: string;
  operation: string | null;
  overwrite: boolean;
  hasError: boolean;
}

export const initialCalculatorState: CalculatorState = {
  displayValue: '0',
  equation: '',
  previousOperand: null,
  currentOperand: '0',
  operation: null,
  overwrite: false,
  hasError: false,
};

export function performMath(a: number, b: number, op: string): number | 'Error' {
  switch (op) {
    case '+':
      return a + b;
    case '−':
    case '-':
      return a - b;
    case '×':
    case '*':
      return a * b;
    case '÷':
    case '/':
      if (b === 0) return 'Error';
      return a / b;
    default:
      return b;
  }
}

export function handleCalculatorInput(
  state: CalculatorState,
  button: string
): CalculatorState {
  if (state.hasError && button !== 'AC') {
    return state;
  }

  switch (button) {
    case 'AC':
      return initialCalculatorState;

    case 'DEL':
    case '⌫':
      if (state.overwrite || state.displayValue.length <= 1 || state.displayValue === '0') {
        return { ...state, displayValue: '0', currentOperand: '0' };
      }
      const trimmed = state.displayValue.slice(0, -1);
      return {
        ...state,
        displayValue: trimmed === '' || trimmed === '-' ? '0' : trimmed,
        currentOperand: trimmed === '' || trimmed === '-' ? '0' : trimmed,
      };

    case '±':
      if (state.displayValue === '0') return state;
      const toggled = state.displayValue.startsWith('-')
        ? state.displayValue.slice(1)
        : '-' + state.displayValue;
      return {
        ...state,
        displayValue: toggled,
        currentOperand: toggled,
      };

    case '%':
      const val = parseFloat(state.displayValue);
      if (isNaN(val)) return state;
      const pct = (val / 100).toString();
      return {
        ...state,
        displayValue: pct,
        currentOperand: pct,
      };

    case '.':
      if (state.overwrite) {
        return {
          ...state,
          displayValue: '0.',
          currentOperand: '0.',
          overwrite: false,
        };
      }
      if (state.displayValue.includes('.')) return state;
      return {
        ...state,
        displayValue: state.displayValue + '.',
        currentOperand: state.displayValue + '.',
      };

    case '+':
    case '−':
    case '×':
    case '÷':
      const currentNum = parseFloat(state.displayValue);
      if (state.previousOperand !== null && state.operation && !state.overwrite) {
        const result = performMath(state.previousOperand, currentNum, state.operation);
        if (result === 'Error') {
          return {
            ...initialCalculatorState,
            displayValue: 'Error',
            hasError: true,
          };
        }
        return {
          ...state,
          displayValue: String(result),
          equation: `${result} ${button}`,
          previousOperand: result,
          operation: button,
          overwrite: true,
        };
      }
      return {
        ...state,
        equation: `${currentNum} ${button}`,
        previousOperand: currentNum,
        operation: button,
        overwrite: true,
      };

    case '=':
      if (state.previousOperand === null || !state.operation) return state;
      const secondNum = parseFloat(state.displayValue);
      const evalResult = performMath(state.previousOperand, secondNum, state.operation);
      if (evalResult === 'Error') {
        return {
          ...initialCalculatorState,
          displayValue: 'Error',
          hasError: true,
        };
      }
      return {
        ...state,
        displayValue: String(evalResult),
        equation: `${state.previousOperand} ${state.operation} ${secondNum} =`,
        previousOperand: null,
        currentOperand: String(evalResult),
        operation: null,
        overwrite: true,
      };

    default:
      // Digits 0-9
      if (!/^[0-9]$/.test(button)) return state;
      if (state.overwrite || state.displayValue === '0') {
        return {
          ...state,
          displayValue: button,
          currentOperand: button,
          overwrite: false,
        };
      }
      return {
        ...state,
        displayValue: state.displayValue + button,
        currentOperand: state.displayValue + button,
      };
  }
}
