import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { shapePlacements, styles } from './styles';

/** Drift: [dx, dy] at the peak of each loop, plus degrees of extra rotation. */
type Drift = { dx: number; dy: number; spin: number; duration: number; delay: number };

const OUTLINE: Drift = { dx: -6, dy: 10, spin: 14, duration: 6000, delay: 0 };
const DOT: Drift = { dx: 8, dy: -6, spin: 0, duration: 4800, delay: 600 };
const TILE: Drift = { dx: -8, dy: -12, spin: -18, duration: 7000, delay: 1200 };

/** Auth background shapes, floating gently. Static when Reduce Motion is on. */
export function Decorations({
  placement = 'signIn',
}: {
  placement?: keyof typeof shapePlacements;
}) {
  const at = shapePlacements[placement];
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <FloatingShape style={[styles.shapeOutline, at.outline]} baseRotate={18} drift={OUTLINE} />
      <FloatingShape style={[styles.shapeDot, at.dot]} baseRotate={0} drift={DOT} />
      <FloatingShape style={[styles.shapeTile, at.tile]} baseRotate={30} drift={TILE} />
    </View>
  );
}

function FloatingShape({
  style,
  baseRotate,
  drift,
}: {
  style: StyleProp<ViewStyle>;
  baseRotate: number;
  drift: Drift;
}) {
  const [progress] = useState(() => new Animated.Value(0));

  useEffect(() => {
    let loop: Animated.CompositeAnimation | undefined;
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      if (reduce || cancelled) return;
      const half = (toValue: number) =>
        Animated.timing(progress, {
          toValue,
          duration: drift.duration / 2,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        });
      loop = Animated.loop(Animated.sequence([half(1), half(0)]));
      Animated.sequence([Animated.delay(drift.delay), loop]).start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
      progress.stopAnimation();
    };
  }, [progress, drift]);

  const range = (to: number) => progress.interpolate({ inputRange: [0, 1], outputRange: [0, to] });
  const rotate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [`${baseRotate}deg`, `${baseRotate + drift.spin}deg`],
  });

  return (
    <Animated.View
      style={[
        style,
        {
          transform: [{ translateX: range(drift.dx) }, { translateY: range(drift.dy) }, { rotate }],
        },
      ]}
    />
  );
}
