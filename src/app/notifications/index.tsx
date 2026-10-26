import { router, Stack, type Href } from 'expo-router';
import { Pressable } from 'react-native';

import { DetailScreen, ErrorState, SkeletonList, Text } from '@/components';
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
} from '@/features/notifications/api';
import type { AppNotification } from '@/features/notifications/data';
import { NotificationsList } from '@/features/notifications/Notifications';
import { notificationRoute } from '@/lib/links';
import { styles } from '@/features/notifications/styles';

/** Opens what the notification is about: its case, else its machine, else its portal link. */
function openTarget(n: AppNotification) {
  const linked = notificationRoute(n.link);
  if (n.caseId) router.push({ pathname: '/case/[id]', params: { id: n.caseId } });
  else if (n.machineId) router.push({ pathname: '/machine/[id]', params: { id: n.machineId } });
  else if (linked) router.push(linked as Href);
}

export default function NotificationsRoute() {
  const query = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();
  const items = query.data?.pages.flatMap((p) => p.items) ?? [];
  const hasUnread = items.some((n) => n.unread);

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () =>
            hasUnread ? (
              <Pressable
                onPress={() => markAll.mutate()}
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
      {query.data ? (
        <NotificationsList
          items={items}
          onLoadMore={query.hasNextPage ? () => query.fetchNextPage() : undefined}
          loadingMore={query.isFetchingNextPage}
          onOpen={(id) => {
            const n = items.find((x) => x.id === id);
            if (n?.unread) markRead.mutate(id);
            if (n) openTarget(n);
          }}
        />
      ) : (
        <DetailScreen>
          {query.isPending ? (
            <SkeletonList rows={5} />
          ) : (
            <ErrorState error={query.error} onRetry={() => query.refetch()} />
          )}
        </DetailScreen>
      )}
    </>
  );
}
