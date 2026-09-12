import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface AutoLockProps {
  autoLockMinutes: number; // 0 = immediate, -1 = never
  isUnlocked: boolean;
  onLock: () => void;
}

export function useAutoLock({
  autoLockMinutes,
  isUnlocked,
  onLock,
}: AutoLockProps) {
  const backgroundTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (autoLockMinutes === -1) return; // Never lock

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        backgroundTimeRef.current = Date.now();
        if (autoLockMinutes === 0 && isUnlocked) {
          onLock();
        }
      } else if (nextAppState === 'active') {
        if (backgroundTimeRef.current && isUnlocked) {
          const elapsedMinutes = (Date.now() - backgroundTimeRef.current) / (1000 * 60);
          if (elapsedMinutes >= autoLockMinutes) {
            onLock();
          }
        }
        backgroundTimeRef.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [autoLockMinutes, isUnlocked, onLock]);
}
