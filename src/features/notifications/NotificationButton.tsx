import { Bell } from 'lucide-react-native';
import { View } from 'react-native';

import { PressableScale } from '@/components/PressableScale/PressableScale';
import { Text } from '@/components/Text/Text';
import { fontFamily, makeStyles, useTheme } from '@/theme';

/** Compact header action, with a count badge that leaves room for the greeting. */
export function NotificationButton({
  unread = 0,
  onPress,
}: {
  unread?: number;
  onPress: () => void;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const hasUnread = unread > 0;
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={hasUnread ? `Notifications, ${unread} unread` : 'Notifications'}
      style={({ pressed }) => [
        styles.button,
        hasUnread && styles.unread,
        pressed && styles.pressed,
      ]}
    >
      <Bell size={22} color={hasUnread ? colors.primaryStrong : colors.ink} strokeWidth={1.7} />
      {hasUnread && (
        <View
          style={styles.badge}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.count} color="onButton">
            {unread > 9 ? '9+' : unread}
          </Text>
        </View>
      )}
    </PressableScale>
  );
}

const useStyles = makeStyles((c) => ({
  button: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unread: { backgroundColor: c.primaryTint, borderColor: c.primaryTintStrong },
  pressed: { backgroundColor: c.primaryTintStrong },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: c.button,
    borderWidth: 2,
    borderColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: { fontFamily: fontFamily.semibold, fontSize: 9, lineHeight: 12 },
}));
