import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BookOpen, CircleUser, House, Truck, type LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { haptics } from '@/lib/haptics';
import { durations, useReducedMotion } from '@/theme';
import { AiTabButton } from './AiTabButton';
import { BAR_PADDING, PILL, useStyles } from './styles';
import { TabItem } from './TabItems';

/** Labels and icons; the order comes from (tabs)/_layout. Cases opens from Me. */
const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Home', icon: House },
  machines: { label: 'Machines', icon: Truck },
  knowledge: { label: 'Knowledge', icon: BookOpen },
  me: { label: 'Me', icon: CircleUser },
};
/** The raised centre tab. */
const AI_ROUTE = 'ask-ai';

const PILL_SPRING = { damping: 18, stiffness: 220, mass: 0.8 };

/** Floating bar: four tabs with a sliding pill, and the AI orb raised in the centre. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const styles = useStyles();
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [width, setWidth] = useState(0);
  const routes = state.routes.filter((r) => r.name === AI_ROUTE || TABS[r.name]);
  const active = state.routes[state.index]?.name;
  const slot = routes.findIndex((r) => r.name === active);
  const pillX = useSharedValue(0);
  const pillOn = useSharedValue(0);

  // The pill follows the active tab and hides under the AI orb.
  useEffect(() => {
    if (!width || slot < 0) return;
    const slotWidth = (width - BAR_PADDING * 2) / routes.length;
    const x = BAR_PADDING + slotWidth * (slot + 0.5) - PILL.width / 2;
    const first = pillOn.get() === 0 && pillX.get() === 0;
    pillX.set(reduced || first ? x : withSpring(x, PILL_SPRING));
    pillOn.set(withTiming(active === AI_ROUTE ? 0 : 1, { duration: durations.tabPop }));
  }, [width, slot, routes.length, active, reduced, pillX, pillOn]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOn.value,
    transform: [{ translateX: pillX.value }, { scale: 0.6 + 0.4 * pillOn.value }],
  }));

  return (
    <View style={[styles.backdrop, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View
        style={styles.bar}
        accessibilityRole="tablist"
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      >
        <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
        {routes.map((route) => {
          const focused = route.name === active;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              haptics.light();
              navigation.navigate(route.name);
            }
          };
          if (route.name === AI_ROUTE) {
            return (
              <AiTabButton
                key={route.key}
                label="AI Assistant"
                focused={focused}
                onPress={onPress}
              />
            );
          }
          const tab = TABS[route.name];
          if (!tab) return null;
          return (
            <TabItem
              key={route.key}
              label={tab.label}
              icon={tab.icon}
              focused={focused}
              onPress={onPress}
            />
          );
        })}
      </View>
    </View>
  );
}
