import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useReducedMotion } from '@/theme';
import { decorativeColors } from '@/theme/palette';

const SHAPES = [
  { left: '8%', top: '14%', size: 68, round: true, filled: false, color: decorativeColors.violet },
  { left: '79%', top: '25%', size: 42, round: false, filled: false, color: decorativeColors.teal },
  { left: '17%', top: '37%', size: 10, round: true, filled: true, color: decorativeColors.amber },
  { left: '82%', top: '64%', size: 76, round: true, filled: false, color: decorativeColors.pink },
  { left: '5%', top: '76%', size: 40, round: false, filled: false, color: decorativeColors.blue },
  { left: '67%', top: '86%', size: 14, round: true, filled: true, color: decorativeColors.coral },
] as const;

/** Decorative native-driven motion, kept behind the screen's interactive content. */
export function FloatingShapes({ variant }: { variant: 'splash' | 'onboarding' }) {
  const [progress] = useState(() => new Animated.Value(0));
  const reduced = useReducedMotion();
  const dark = variant === 'splash';

  useEffect(() => {
    progress.setValue(0);
    if (reduced) return;

    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
        isInteraction: false,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [progress, reduced]);

  return (
    <View
      style={styles.root}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {SHAPES.map((shape, index) => {
        const direction = index % 2 === 0 ? 1 : -1;
        const color = shape.color;
        return (
          <Animated.View
            key={index}
            style={{
              position: 'absolute',
              left: shape.left,
              top: shape.top,
              width: shape.size,
              height: shape.size,
              borderRadius: shape.round ? shape.size / 2 : 10,
              borderWidth: shape.filled ? 0 : 2,
              borderColor: color,
              backgroundColor: shape.filled ? color : 'transparent',
              opacity: dark ? 0.65 : 0.4,
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, direction * (18 + index * 2), 0],
                  }),
                },
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0, direction * 12, 0],
                  }),
                },
                {
                  rotate: progress.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: ['-12deg', '12deg', '-12deg'],
                  }),
                },
              ],
            }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFill, overflow: 'hidden' },
});
