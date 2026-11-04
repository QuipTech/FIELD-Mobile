import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar/Avatar';
import { Text } from '@/components/Text/Text';
import { DrawerMenuButton } from '@/features/navigation/DrawerMenu';
import { NotificationButton } from '@/features/notifications/NotificationButton';
import { styles } from './styles';

export type HomeHeaderProps = {
  title: string;
  subtitle: string;
  initials: string;
  avatarUrl?: string | null;
  /** Unread notifications shown in the bell badge. */
  unread?: number;
  onNotifications: () => void;
  onProfile: () => void;
};

/** M2 top bar: greeting, site summary, notifications and profile avatar. */
export function HomeHeader({
  title,
  subtitle,
  initials,
  avatarUrl,
  unread = 0,
  onNotifications,
  onProfile,
}: HomeHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerShape} pointerEvents="none" />
      <DrawerMenuButton />
      <View style={styles.headerText}>
        <Text style={styles.headerTitle} accessibilityRole="header" numberOfLines={2}>
          {title}
        </Text>
        <Text variant="caption" color="inkMuted" numberOfLines={1}>
          {subtitle}
        </Text>
      </View>
      <NotificationButton unread={unread} onPress={onNotifications} />
      <Pressable
        onPress={onProfile}
        style={styles.avatar}
        accessibilityRole="button"
        accessibilityLabel="Your profile"
      >
        <Avatar name={initials} imageUrl={avatarUrl} size={36} />
      </Pressable>
    </View>
  );
}
