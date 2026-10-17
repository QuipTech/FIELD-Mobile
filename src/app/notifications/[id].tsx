import { router, useLocalSearchParams } from 'expo-router';
import { SearchX } from 'lucide-react-native';
import { useEffect } from 'react';

import { DetailScreen, EmptyPanel } from '@/components';
import { useNotifications, useReadState } from '@/features/notifications/data';
import { NotificationDetail } from '@/features/notifications/Notifications';

export default function NotificationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = useNotifications().find((n) => n.id === id);
  const markRead = useReadState((s) => s.markRead);

  // Opening from a push notification (not the list) also counts as reading it.
  useEffect(() => {
    if (id) markRead(id);
  }, [id, markRead]);

  if (!item) {
    return (
      <DetailScreen>
        <EmptyPanel icon={SearchX} title="Notification not found" />
      </DetailScreen>
    );
  }
  return (
    <NotificationDetail
      item={item}
      onOpenCase={(caseId) => router.push({ pathname: '/case/[id]', params: { id: caseId } })}
      onViewMachine={(machineId) =>
        router.push({ pathname: '/machine/[id]', params: { id: machineId } })
      }
    />
  );
}
