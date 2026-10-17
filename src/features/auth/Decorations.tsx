import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { useMotionAllowed } from '@/lib/motion';
import {
  plusBar,
  shapePlacements,
  shapeStyle,
  type ShapePlacement,
  type ShapeSpec,
} from './decorationShapes';

/** Auth background shapes, wandering slowly. Static when Reduce Motion is on. */
export function Decorations({ placement = 'signIn' }: { placement?: ShapePlacement }) {
  const animate = useMotionAllowed();
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {shapePlacements[placement].map((spec, i) => (
        <FloatingShape key={i} spec={spec} animate={animate} />
      ))}
    </View>
  );
}

/** A 0 → 1 → 0 sine loop of `periodMs`, started after `delayMs` while `enabled`. */
function useSwing(periodMs: number, delayMs: number, enabled: boolean) {
  const [value] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!enabled) return;
    const half = (toValue: number) =>
      Animated.timing(value, {
        toValue,
        duration: periodMs / 2,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });
    const anim = Animated.sequence([
      Animated.delay(delayMs),
      Animated.loop(Animated.sequence([half(1), half(0)])),
    ]);
    anim.start();
    return () => {
      anim.stop();
      value.setValue(0);
    };
  }, [value, periodMs, delayMs, enabled]);
  return value;
}

function FloatingShape({ spec, animate }: { spec: ShapeSpec; animate: boolean }) {
  const { drift, rotate } = spec;
  const x = useSwing(drift.periodMs, drift.delayMs, animate);
  const y = useSwing(Math.round(drift.periodMs * 1.4), drift.delayMs, animate);

  const transform = [
    {
      translateX: x.interpolate({
        inputRange: [0, 1],
        outputRange: [0, drift.dx],
      }),
    },
    {
      translateY: y.interpolate({
        inputRange: [0, 1],
        outputRange: [0, drift.dy],
      }),
    },
    {
      rotate: y.interpolate({
        inputRange: [0, 1],
        outputRange: [`${rotate}deg`, `${rotate + drift.spin}deg`],
      }),
    },
  ];

  return (
    <Animated.View style={[shapeStyle(spec), spec.at, { transform }]}>
      {spec.kind === 'plus' && (
        <>
          <View style={plusBar(spec, false)} />
          <View style={plusBar(spec, true)} />
        </>
      )}
    </Animated.View>
  );
}
