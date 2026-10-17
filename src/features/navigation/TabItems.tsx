import type { LucideIcon } from 'lucide-react-native';
import { Sparkles } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Easing, Pressable, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { useMotionAllowed } from '@/lib/motion';
import { colors } from '@/theme';
import { styles } from './styles';

type TabProps = { label: string; focused: boolean; onPress: () => void };

/** A regular tab: the icon sits in a soft pill that springs in when the tab is selected. */
export function TabItem({ label, icon: Icon, focused, onPress }: TabProps & { icon: LucideIcon }) {
  const [on] = useState(() => new Animated.Value(focused ? 1 : 0));
  useEffect(() => {
    Animated.spring(on, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [on, focused]);

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <Animated.View
          style={[
            styles.indicator,
            {
              opacity: on,
              transform: [
                { scaleX: on.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            },
          ]}
        />
        <Icon
          size={22}
          color={focused ? colors.brand : colors.inkSubtle}
          strokeWidth={focused ? 2.25 : 2}
        />
      </View>
      <Text style={[styles.label, focused && styles.labelOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

/** The raised Ask AI button: floats gently with a soft pulsing glow (still with Reduce Motion). */
export function FabItem({ label, focused, onPress }: TabProps) {
  const motion = useMotionAllowed();
  const [float] = useState(() => new Animated.Value(0));
  const [press] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!motion) return;
    const half = (toValue: number) =>
      Animated.timing(float, {
        toValue,
        duration: 1500,
        easing: Easing.inOut(Easing.sin),
        useNativeDriver: true,
      });
    const loop = Animated.loop(Animated.sequence([half(1), half(0)]));
    loop.start();
    return () => {
      loop.stop();
      float.setValue(0);
    };
  }, [float, motion]);

  const squash = (toValue: number) =>
    Animated.spring(press, { toValue, useNativeDriver: true, speed: 40, bounciness: 8 }).start();
  const range = (to: number, from = 0) =>
    float.interpolate({ inputRange: [0, 1], outputRange: [from, to] });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => squash(0.9)}
      onPressOut={() => squash(1)}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <Animated.View
        style={[styles.fab, { transform: [{ translateY: range(-5) }, { scale: press }] }]}
      >
        <Animated.View
          style={[
            styles.fabGlow,
            { opacity: range(0.12, 0.4), transform: [{ scale: range(1.22, 1) }] },
          ]}
        />
        <View style={styles.fabClip}>
          <Svg width="100%" height="100%" viewBox="0 0 1 1">
            <Defs>
              <LinearGradient id="fab" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.brand} />
                <Stop offset="1" stopColor={colors.brandGlowViolet} />
              </LinearGradient>
            </Defs>
            <Rect width="1" height="1" fill="url(#fab)" />
          </Svg>
        </View>
        <Sparkles size={24} color={colors.onAccent} strokeWidth={2} />
      </Animated.View>
      <Text style={[styles.label, styles.fabLabel, focused && styles.labelOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
