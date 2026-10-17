import { router } from 'expo-router';

import { useMachineHistory } from '@/features/history/data';
import { MachineHistory } from '@/features/history/MachineHistory';

export default function MachineHistoryRoute() {
  const entries = useMachineHistory();
  return (
    <MachineHistory
      entries={entries}
      onOpenEntry={(entry) =>
        router.push({ pathname: '/machine/[id]/history', params: { id: entry.machineId } })
      }
    />
  );
}
