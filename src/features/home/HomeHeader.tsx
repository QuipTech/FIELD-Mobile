import { Bell } from 'lucide-react-native';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { styles } from './styles';

export type HomeHeaderProps = {
  title: string;
  subtitle: string;
  initials: string;
  onNotifications: () => void;
  onProfile: () => void;
};

/** M2 top bar: greeting, site summary, notifications and profile avatar. */
export function HomeHeader({
  title,
  subtitle,
  initials,
  onNotifications,
  onProfile,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerShape} pointerEvents="none" />
      <View style={styles.headerText}>
        <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={1}>
          {title}
        </Text>
        <Text variant="caption" color="inkMuted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <Pressable
        onPress={onNotifications}
        style={styles.bell}
        accessibilityRole="button"
        accessibilityLabel="Notifications"
      >
        <Bell size={20} color={colors.amber} strokeWidth={2} />
      </Pressable>
      <Pressable
        onPress={onProfile}
        style={styles.avatar}
        accessibilityRole="button"
        accessibilityLabel="Your profile"
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </Pressable>
    </View>
  );
}
