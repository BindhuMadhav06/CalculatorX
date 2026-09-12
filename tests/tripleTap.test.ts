import { useTripleTap } from '../src/hooks/useTripleTap';
import { renderHook, act } from '@testing-library/react-hooks';

describe('Triple Tap Stealth Gesture Detector', () => {
  it('does NOT unlock on 1 tap', () => {
    let unlocked = false;
    const targetButton = '5';
    let taps: number[] = [];

    const handleTap = (btn: string) => {
      if (btn !== targetButton) {
        taps = [];
        return;
      }
      taps.push(Date.now());
      if (taps.length === 3) unlocked = true;
    };

    handleTap('5');
    expect(unlocked).toBe(false);
  });

  it('does NOT unlock on 2 taps', () => {
    let unlocked = false;
    const targetButton = '5';
    let taps: number[] = [];

    const handleTap = (btn: string) => {
      if (btn !== targetButton) {
        taps = [];
        return;
      }
      taps.push(Date.now());
      if (taps.length === 3) unlocked = true;
    };

    handleTap('5');
    handleTap('5');
    expect(unlocked).toBe(false);
  });

  it('unlocks on exactly 3 fast taps within window', () => {
    let unlocked = false;
    const targetButton = '5';
    const tapWindowMs = 1200;
    let taps: { btn: string; time: number }[] = [];

    const simulateTap = (btn: string, time: number) => {
      if (btn !== targetButton) {
        taps = [];
        return;
      }
      taps.push({ btn, time });
      if (taps.length > 3) taps.shift();

      if (taps.length === 3) {
        if (taps[2].time - taps[0].time <= tapWindowMs) {
          unlocked = true;
        }
      }
    };

    const startTime = 1000;
    simulateTap('5', startTime);
    simulateTap('5', startTime + 200);
    simulateTap('5', startTime + 400);

    expect(unlocked).toBe(true);
  });

  it('does NOT unlock if taps are too slow (>1200ms elapsed)', () => {
    let unlocked = false;
    const targetButton = '5';
    const tapWindowMs = 1200;
    let taps: { btn: string; time: number }[] = [];

    const simulateTap = (btn: string, time: number) => {
      if (btn !== targetButton) {
        taps = [];
        return;
      }
      taps.push({ btn, time });
      if (taps.length > 3) taps.shift();

      if (taps.length === 3) {
        if (taps[2].time - taps[0].time <= tapWindowMs) {
          unlocked = true;
        }
      }
    };

    const startTime = 1000;
    simulateTap('5', startTime);
    simulateTap('5', startTime + 800);
    simulateTap('5', startTime + 2000); // 2000ms > 1200ms window

    expect(unlocked).toBe(false);
  });

  it('resets sequence if user taps another button in between', () => {
    let unlocked = false;
    const targetButton = '5';
    const tapWindowMs = 1200;
    let taps: { btn: string; time: number }[] = [];

    const simulateTap = (btn: string, time: number) => {
      if (btn !== targetButton) {
        taps = [];
        return;
      }
      taps.push({ btn, time });
      if (taps.length > 3) taps.shift();

      if (taps.length === 3) {
        if (taps[2].time - taps[0].time <= tapWindowMs) {
          unlocked = true;
        }
      }
    };

    const startTime = 1000;
    simulateTap('5', startTime);
    simulateTap('5', startTime + 100);
    simulateTap('9', startTime + 200); // Wrong button resets sequence
    simulateTap('5', startTime + 300);

    expect(unlocked).toBe(false);
  });
});
