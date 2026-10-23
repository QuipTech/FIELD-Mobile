import { router, useLocalSearchParams } from 'expo-router';

import { toast } from '@/components';
import { CaptureFlow } from '@/features/capture/CaptureFlow';
import { queueEntry } from '@/features/capture/queue';
import type { CaptureDraft } from '@/features/capture/store';
import { useMachines } from '@/features/machines/api';
import { ENTRY_TYPE, type EntryType } from '@/features/machines/records';
import { useIsOffline } from '@/lib/network';

const isEntryType = (t: string | undefined): t is EntryType => !!t && t in ENTRY_TYPE;

export default function CaptureRoute() {
  const params = useLocalSearchParams<{ machineId?: string; type?: string; title?: string }>();
  const { data: machines = [] } = useMachines();
  const offline = useIsOffline();

  const save = (draft: CaptureDraft & { machineId: string }) => {
    const label = machines.find((m) => m.id === draft.machineId)?.label ?? 'machine';
    queueEntry(draft);
    toast.success(
      offline
        ? 'Saved on this device. It uploads when you’re back online.'
        : `Saved to ${label} history.`,
    );
    router.back();
  };

  return (
    <CaptureFlow
      machines={machines}
      initial={{
        machineId: params.machineId,
        title: params.title ?? '',
        ...(isEntryType(params.type) && { type: params.type }),
      }}
      onClose={() => router.back()}
      onSave={save}
    />
  );
}
