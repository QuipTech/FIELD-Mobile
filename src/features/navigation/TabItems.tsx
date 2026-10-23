import type { LucideIcon } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Animated, Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
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
