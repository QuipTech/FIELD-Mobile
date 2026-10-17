import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { House, LifeBuoy, Truck, User, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { styles } from './styles';
import { FabItem, TabItem } from './TabItems';

const TABS: Record<string, { label: string; icon?: LucideIcon }> = {
  index: { label: 'Home', icon: House },
  machines: { label: 'Machines', icon: Truck },
  'ask-ai': { label: 'Ask AI' }, // the raised button
  cases: { label: 'Cases', icon: LifeBuoy },
  me: { label: 'Me', icon: User },
};

/** M2 bottom bar: rounded white sheet with a raised, floating Ask AI button in the middle. */
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
          return tab.icon ? (
            <TabItem
              key={route.key}
              label={tab.label}
              icon={tab.icon}
              focused={focused}
              onPress={onPress}
            />
          ) : (
            <FabItem key={route.key} label={tab.label} focused={focused} onPress={onPress} />
          );
        })}
      </View>
    </View>
  );
}
