import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert } from 'react-native';

import { Screen, toast } from '@/components';
import { openDoc } from '@/features/knowledge/navigation';
import { useOfflineLibrary } from '@/features/knowledge/offlineStore';
import { OfflineSync } from '@/features/offline/OfflineSync';
import { useIsOffline } from '@/lib/network';
import { FailedUploads } from '@/features/offline/FailedUploads';
import { useOutbox, type OutboxItem } from '@/offline/outbox';
import { flushOutbox, retryOutboxItem } from '@/offline/sync';

export default function OfflineSyncRoute() {
  const offline = useIsOffline();
  const queryClient = useQueryClient();
  const docs = useOfflineLibrary((s) => s.docs);
  const clear = useOfflineLibrary((s) => s.clear);
  const queued = useOutbox((s) => s.items);
  const removeQueued = useOutbox((s) => s.remove);
  const failed = queued.filter((i) => i.error);
  const [syncing, setSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>();

  const sync = async () => {
    setSyncing(true);
    try {
      await flushOutbox();
      await queryClient.refetchQueries({ type: 'active' });
      setLastSyncedAt(Date.now());
      toast.show('All synced.');
    } catch {
      toast.show('Sync failed. Try again.');
    } finally {
      setSyncing(false);
    }
  };

  const confirmClear = () =>
    Alert.alert('Clear saved data?', 'Saved documents are removed from this device.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clear },
    ]);

  const confirmDiscard = (item: OutboxItem) =>
    Alert.alert('Discard this change?', 'It hasn’t reached the server and can’t be recovered.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Discard', style: 'destructive', onPress: () => removeQueued(item.id) },
    ]);

  return (
    <Screen>
      <OfflineSync
        offline={offline}
        savedDocs={docs}
        pending={queued.length}
        lastSyncedAt={lastSyncedAt}
        syncing={syncing}
        onSync={sync}
        onClear={confirmClear}
        onOpenDoc={(id) => openDoc(id)}
      />
      <FailedUploads
        items={failed}
        onRetry={(id) => retryOutboxItem(id).catch(() => undefined)}
        onDiscard={confirmDiscard}
      />
    </Screen>
  );
}
