import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { Text } from '@/components/Text/Text';
import { scales, springs, useReducedMotion, useTheme } from '@/theme';
import { useStyles } from './styles';

type TabProps = { label: string; icon: LucideIcon; focused: boolean; onPress: () => void };

/** A regular tab: the icon pops when selected; the sliding pill behind it lives in TabBar. */
export function TabItem({ label, icon: Icon, focused, onPress }: TabProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const pop = useSharedValue(1);

  useEffect(() => {
    if (focused && !reduced) {
      pop.set(
        withSequence(withSpring(scales.tabPop, springs.tabPop), withSpring(1, springs.tabPop)),
      );
    }
  }, [focused, reduced, pop]);

  const iconStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tab}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
    >
      <View style={styles.iconWrap}>
        <Animated.View style={iconStyle}>
          <Icon
            size={22}
            color={focused ? colors.primary : colors.faint}
            strokeWidth={focused ? 2.3 : 1.9}
          />
        </Animated.View>
      </View>
      <Text style={[styles.label, focused && styles.labelOn]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}
