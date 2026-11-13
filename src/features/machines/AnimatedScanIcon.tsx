import { Scan } from 'lucide-react-native';
import { useEffect } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { colors, easing, loops, useReducedMotion } from '@/theme';

export function AnimatedScanIcon({
  size = 25,
  color = colors.onAccent,
}: {
  size?: number;
  color?: string;
}) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(0.5);
  const sweep = useAnimatedStyle(() => ({
    transform: [{ translateY: (progress.get() - 0.5) * size * 0.56 }],
    opacity: 0.6 + Math.sin(progress.get() * Math.PI) * 0.4,
  }));

  useEffect(() => {
    const update = () => {
      cancelAnimation(progress);
      progress.set(0.5);
      if (reduced || AppState.currentState !== 'active') return;
      progress.set(
        withRepeat(
          withSequence(
            withTiming(0, { duration: loops.scanSweep / 4, easing: easing.standard }),
            withTiming(1, { duration: loops.scanSweep / 2, easing: easing.standard }),
            withTiming(0.5, { duration: loops.scanSweep / 4, easing: easing.standard }),
            withDelay(7000, withTiming(0.5, { duration: 0 })),
          ),
          -1,
          false,
        ),
      );
    };
    update();
    const subscription = AppState.addEventListener('change', update);
    return () => {
      subscription.remove();
      cancelAnimation(progress);
    };
  }, [progress, reduced]);

  return (
    <View
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.frame, { width: size + 1, height: size + 1 }]}
    >
      <Scan size={size} color={color} strokeWidth={1.8} />
      <Animated.View style={[styles.line, { width: size * 0.6, backgroundColor: color }, sweep]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { width: 26, height: 26, alignItems: 'center', justifyContent: 'center' },
  line: {
    position: 'absolute',
    width: 15,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.onAccent,
  },
});
