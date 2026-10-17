import { router, useLocalSearchParams } from 'expo-router';

import { toast } from '@/components';
import { CaptureFlow } from '@/features/capture/CaptureFlow';
import { toEntry, useEntryLog } from '@/features/capture/store';
import { useMachines } from '@/features/machines/data';
import { ENTRY_TYPE, type EntryType } from '@/features/machines/records';

const isEntryType = (t: string | undefined): t is EntryType => !!t && t in ENTRY_TYPE;

export default function CaptureRoute() {
  const params = useLocalSearchParams<{ machineId?: string; type?: string; title?: string }>();
  const { data: machines } = useMachines();
  const add = useEntryLog((s) => s.add);

  return (
    <CaptureFlow
      machines={machines}
      initial={{
        machineId: params.machineId,
        title: params.title ?? '',
        ...(isEntryType(params.type) && { type: params.type }),
      }}
      onClose={() => router.back()}
      onSave={(draft) => {
        add(toEntry(draft));
        toast.success(`Saved to ${draft.machineId} history.`);
        router.back();
      }}
    />
  );
}
