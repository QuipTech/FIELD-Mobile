import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { toast } from '@/components/Toast/store';
import { queueEntryPhotos, type PhotoBatch } from '@/features/capture/queue';
import { QuickCapture } from '@/features/capture/QuickCapture';
import { useMachineHistory, useMachines } from '@/features/machines/api';
import { useIsOffline } from '@/lib/network';

export default function CapturePhotoRoute() {
  const params = useLocalSearchParams<{ machineId?: string; entryId?: string }>();
  const { data: machines = [] } = useMachines();
  const offline = useIsOffline();
  const [picked, setPicked] = useState(params.machineId);
  const machineId = picked ?? machines[0]?.id;
  // The API's history only: entries still queued on this device have no server id to attach to.
  const history = useMachineHistory(machineId);

  const save = (batch: PhotoBatch) => {
    queueEntryPhotos(batch);
    const n = batch.photos.length;
    const photos = `${n} photo${n === 1 ? '' : 's'}`;
    toast.success(
      offline
        ? `${photos} saved on this device. They upload when you’re back online.`
        : `${photos} added to the entry.`,
    );
    router.back();
  };

  return (
    <QuickCapture
      machines={machines}
      machineId={machineId}
      onMachineChange={setPicked}
      entries={history.data ?? []}
      entriesLoading={history.isPending && !!machineId}
      initialEntryId={params.entryId}
      onClose={() => router.back()}
      onSave={save}
    />
  );
}
