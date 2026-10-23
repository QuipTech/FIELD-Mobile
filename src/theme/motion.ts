import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { Easing, FadeIn, FadeOut, type WithSpringConfig } from 'react-native-reanimated';

/**
 * Motion presets from the design's Motion section. Short and functional: nothing on a
 * critical path runs longer than 400 ms. With Reduce Motion on, movement becomes a 150 ms
 * fade and loops stop (except the sync spinner).
 */

export const durations = {
  press: 90,
  tokenFade: 120,
  reducedFade: 150,
  tabPop: 180,
  small: 200, // toast, offline banner, sheet close
  navigation: 240,
  sheet: 320,
  meter: 600,
  toastHold: 2500,
  offlineAutoHide: 2000,
} as const;

/** Loop periods. */
export const loops = {
  skeleton: 1400,
  scanSweep: 1800,
  spinner: 1000,
  caret: 1000,
  typingDots: 1200,
} as const;

/** Standard easing (0.2, 0, 0, 1). Springs are only for sheets and the tab icon. */
export const easing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  linear: Easing.linear,
} as const;

export const springs = {
  sheet: { damping: 20, stiffness: 220 },
  tabPop: { damping: 12, stiffness: 400 },
} satisfies Record<string, WithSpringConfig>;

export const scales = { press: 0.97, tabPop: 1.15 } as const;

export const skeletonOpacity = { from: 0.55, to: 1 } as const;

/** Sheet scrim opacity when fully open. */
export const scrimOpacity = 0.45;

/** Layout-animation entering/exiting presets that respect Reduce Motion. */
export const fadeIn = (reduced: boolean, duration: number = durations.small) =>
  FadeIn.duration(reduced ? durations.reducedFade : duration);
export const fadeOut = (reduced: boolean, duration: number = durations.small) =>
  FadeOut.duration(reduced ? durations.reducedFade : duration);

/** True while the OS "Reduce motion" setting is on; follows live changes. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => !cancelled && setReduced(value))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => {
      cancelled = true;
      sub.remove();
    };
  }, []);
  return reduced;
}
