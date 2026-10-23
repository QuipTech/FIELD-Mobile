import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { durations, easing, makeStyles, useReducedMotion } from '@/theme';
import { Text } from '../Text/Text';

export type MeterProps = {
  value: number;
  max: number;
  /** e.g. "142 of 500 queries this month". */
  label?: string;
  /** e.g. "Resets 1 Nov". */
  caption?: string;
  /** Amber fill once usage passes the allowance (overage never blocks). */
  tone?: 'primary' | 'warning';
  testID?: string;
};

/** Usage meter (`.meter`). Fills from 0 over 600 ms on first view; instant with Reduce Motion. */
export function Meter({ value, max, label, caption, tone = 'primary', testID }: MeterProps) {
  const styles = useStyles();
  const reduced = useReducedMotion();
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;
  const width = useSharedValue(0);
  const fill = useAnimatedStyle(() => ({ width: `${width.get() * 100}%` }));

  useEffect(() => {
    width.set(
      reduced
        ? ratio
        : withTiming(ratio, {
            duration: durations.meter,
            easing: easing.standard,
          }),
    );
  }, [ratio, reduced, width]);

  return (
    <View style={styles.wrapper} testID={testID}>
      {label && <Text variant="row">{label}</Text>}
      <View
        style={styles.track}
        accessibilityRole="progressbar"
        accessibilityLabel={label}
        accessibilityValue={{ min: 0, max, now: Math.min(value, max) }}
      >
        <Animated.View style={[styles.fill, tone === 'warning' && styles.warning, fill]} />
      </View>
      {caption && (
        <Text variant="caption" color="muted">
          {caption}
        </Text>
      )}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  wrapper: { gap: 6 },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: c.fill,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4, backgroundColor: c.primary },
  warning: { backgroundColor: c.warning },
}));
