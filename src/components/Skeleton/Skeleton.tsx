import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { loops, makeStyles, radii, skeletonOpacity, useReducedMotion } from '@/theme';

export type SkeletonProps = { width?: DimensionValue; height?: number; radius?: number };

/** Pulsing placeholder (`.sk`): opacity 0.55 ↔ 1 over 1.4 s; still with Reduce Motion. */
export function Skeleton({ width = '100%', height = 14, radius = radii.badge }: SkeletonProps) {
  const styles = useStyles();
  const reduced = useReducedMotion();
  const opacity = useSharedValue<number>(skeletonOpacity.from);
  const pulse = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  useEffect(() => {
    if (reduced) {
      opacity.set(skeletonOpacity.from);
      return;
    }
    opacity.set(
      withRepeat(withTiming(skeletonOpacity.to, { duration: loops.skeleton / 2 }), -1, true),
    );
    return () => cancelAnimation(opacity);
  }, [opacity, reduced]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius }, pulse]}
    />
  );
}

const useStyles = makeStyles((c) => ({ block: { backgroundColor: c.fill } }));
