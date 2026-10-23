import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { BookOpen, House, LifeBuoy, Sparkles, Truck, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { TabItem } from './TabItems';

/** Order and labels from the FIELD mobile design. Profile is opened from the Home avatar. */
const TABS: Record<string, { label: string; icon: LucideIcon }> = {
  index: { label: 'Home', icon: House },
  machines: { label: 'Machines', icon: Truck },
  knowledge: { label: 'Knowledge', icon: BookOpen },
  'ask-ai': { label: 'AI Assistant', icon: Sparkles },
  cases: { label: 'Cases', icon: LifeBuoy },
};

/** Bottom bar: five tabs; the active icon sits in a soft pill that springs in. */
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
