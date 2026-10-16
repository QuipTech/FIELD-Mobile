import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { LayoutGrid, LifeBuoy, Sparkles, Truck, User, type LucideIcon } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

const TABS: Record<string, { label: string; icon: LucideIcon; fab?: boolean }> = {
  index: { label: 'Home', icon: LayoutGrid },
  machines: { label: 'Machines', icon: Truck },
  'ask-ai': { label: 'Ask AI', icon: Sparkles, fab: true },
  cases: { label: 'Cases', icon: LifeBuoy },
  me: { label: 'Me', icon: User },
};

/** M2 bottom bar: rounded white sheet with a raised gradient Ask AI button in the middle. */
export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.backdrop}>
      <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]} accessibilityRole="tablist">
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const focused = state.index === i;
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };
          const Icon = tab.icon;
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={tab.label}
            >
              {tab.fab ? (
                <Fab />
              ) : (
                <Icon size={24} color={focused ? colors.brand : colors.inkSubtle} strokeWidth={2} />
              )}
              <Text
                style={[styles.label, focused && styles.labelOn, tab.fab && styles.fabLabel]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Fab() {
  return (
    <View style={styles.fab}>
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
    </View>
  );
}
