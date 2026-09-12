import { useRef, useCallback } from 'react';

interface TripleTapProps {
  targetButton: string; // e.g. "5"
  tapWindowMs?: number; // e.g. 1200ms
  onTripleTapSuccess: () => void;
}

export function useTripleTap({
  targetButton,
  tapWindowMs = 1200,
  onTripleTapSuccess,
}: TripleTapProps) {
  const tapTimestampsRef = useRef<number[]>([]);

  const handleButtonTap = useCallback(
    (buttonLabel: string) => {
      const now = Date.now();

      // Taps elsewhere reset sequence immediately
      if (buttonLabel !== targetButton) {
        tapTimestampsRef.current = [];
        return;
      }

      // Append current tap timestamp
      tapTimestampsRef.current.push(now);

      // Keep only last 3 taps
      if (tapTimestampsRef.current.length > 3) {
        tapTimestampsRef.current.shift();
      }

      // Check if we have 3 taps within tapWindowMs
      if (tapTimestampsRef.current.length === 3) {
        const firstTap = tapTimestampsRef.current[0];
        const thirdTap = tapTimestampsRef.current[2];
        const elapsed = thirdTap - firstTap;

        if (elapsed <= tapWindowMs) {
          // Success! Reset taps and trigger hidden unlock
          tapTimestampsRef.current = [];
          onTripleTapSuccess();
        }
      }
    },
    [targetButton, tapWindowMs, onTripleTapSuccess]
  );

  return { handleButtonTap };
}
