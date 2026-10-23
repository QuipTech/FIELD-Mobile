import { useEffect } from 'react';
import {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { springs, useReducedMotion } from '@/theme';

const sine = Easing.inOut(Easing.sin);

/** Endless ping-pong between 0 and 1. */
const pingPong = (ms: number) =>
  withRepeat(withTiming(1, { duration: ms, easing: sine }), -1, true);

/**
 * Motion for the centre AI orb: it floats, its glow ring spins, its halo pulses and its icon
 * twinkles; pressing squeezes it. Loops stop (and settle at rest) while Reduce Motion is on.
 */
export function useOrbMotion() {
  const reduced = useReducedMotion();
  const float = useSharedValue(0);
  const spin = useSharedValue(0);
  const pulse = useSharedValue(0);
  const twinkle = useSharedValue(0);
  const press = useSharedValue(1);

  useEffect(() => {
    const loops = [float, spin, pulse, twinkle];
    if (reduced) {
      loops.forEach((v) => {
        cancelAnimation(v);
        v.set(0);
      });
      return;
    }
    float.set(pingPong(1600));
    twinkle.set(pingPong(1100));
    spin.set(withRepeat(withTiming(1, { duration: 3600, easing: Easing.linear }), -1));
    pulse.set(withRepeat(withTiming(1, { duration: 2000, easing: Easing.out(Easing.quad) }), -1));
    return () => loops.forEach(cancelAnimation);
  }, [reduced, float, spin, pulse, twinkle]);

  return {
    floatStyle: useAnimatedStyle(() => ({
      transform: [{ translateY: -3 * float.value }, { scale: press.value }],
    })),
    ringStyle: useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value * 360}deg` }] })),
    haloStyle: useAnimatedStyle(() => ({
      opacity: 0.4 * (1 - pulse.value),
      transform: [{ scale: 1 + 0.45 * pulse.value }],
    })),
    iconStyle: useAnimatedStyle(() => ({
      transform: [
        { rotate: `${-10 + 20 * twinkle.value}deg` },
        { scale: 1 + 0.08 * twinkle.value },
      ],
    })),
    pressIn: () => press.set(withSpring(0.9, springs.tabPop)),
    pressOut: () => press.set(withSpring(1, springs.tabPop)),
  };
}
