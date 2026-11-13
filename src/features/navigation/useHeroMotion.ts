import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useReducedMotion } from '@/theme';

const sine = Easing.inOut(Easing.sin);
const pingPong = (ms: number) =>
  withRepeat(withTiming(1, { duration: ms, easing: sine }), -1, true);

/**
 * Slow ambient drift for the drawer hero's orb and ring, out of step so it never looks
 * mechanical. Stops and settles at rest while Reduce Motion is on.
 */
export function useHeroMotion() {
  const reduced = useReducedMotion();
  const drift = useSharedValue(0);
  const breathe = useSharedValue(0);

  useEffect(() => {
    const all = [drift, breathe];
    if (reduced) {
      all.forEach((v) => {
        cancelAnimation(v);
        v.set(0);
      });
      return;
    }
    drift.set(pingPong(4200));
    breathe.set(pingPong(3100));
    return () => all.forEach(cancelAnimation);
  }, [reduced, drift, breathe]);

  return {
    orbStyle: useAnimatedStyle(() => ({
      opacity: 0.14 + 0.1 * breathe.value,
      transform: [
        { translateX: -14 * drift.value },
        { translateY: 10 * drift.value },
        { scale: 1 + 0.12 * breathe.value },
      ],
    })),
    ringStyle: useAnimatedStyle(() => ({
      transform: [
        { translateX: 12 * breathe.value },
        { translateY: -10 * drift.value },
        { scale: 1 + 0.06 * drift.value },
      ],
    })),
  };
}
