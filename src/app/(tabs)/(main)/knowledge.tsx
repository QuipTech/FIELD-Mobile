import { router } from 'expo-router';
import { useCallback } from 'react';

import { TabHeader } from '@/components/TabHeader/TabHeader';
import type { KnowledgeResult } from '@/features/knowledge/library/api';
import { openReader } from '@/features/knowledge/library/openReader';
import { KnowledgeLibrary } from '@/features/knowledge/library/KnowledgeLibrary';
import { openDoc } from '@/features/knowledge/navigation';
import { OfflineLibrary } from '@/features/knowledge/OfflineLibrary';
import { useOfflineLibrary } from '@/features/knowledge/offlineStore';
import { NotificationButton } from '@/features/notifications/NotificationButton';
import { useIsOffline } from '@/lib/network';
import { queryClient } from '@/lib/queryClient';

export default function KnowledgeRoute() {
  const offline = useIsOffline();
  const savedDocs = useOfflineLibrary((s) => s.docs);
  const onOpen = useCallback((item: KnowledgeResult) => openReader(item.id, item.sectionId), []);

  return (
    <>
      <TabHeader
        title="Knowledge"
        right={<NotificationButton onPress={() => router.push('/notifications')} />}
      />
      {offline ? (
        // No connection: documents saved on this device.
        <OfflineLibrary
          docs={savedDocs}
          onRetry={() => void queryClient.invalidateQueries({ queryKey: ['knowledge'] })}
          onOpenDoc={(id) => openDoc(id)}
        />
      ) : (
        <KnowledgeLibrary onOpen={onOpen} />
      )}
    </>
  );
}
