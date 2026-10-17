import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { Text } from '@/components';
import { useNotifications, useReadState } from '@/features/notifications/data';
import { NotificationsList } from '@/features/notifications/Notifications';
import { styles } from '@/features/notifications/styles';

export default function NotificationsRoute() {
  const items = useNotifications();
  const { markRead, markAllRead } = useReadState();
  const unread = items.filter((n) => n.unread).map((n) => n.id);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            unread.length > 0 ? (
              <Pressable
                onPress={() => markAllRead(unread)}
                style={styles.markAll}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text variant="caption" color="brand" style={styles.markAllText}>
                  Mark all read
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <NotificationsList
        items={items}
        onOpen={(id) => {
          markRead(id);
          router.push({ pathname: '/notifications/[id]', params: { id } });
        }}
      />
    </>
  );
}
