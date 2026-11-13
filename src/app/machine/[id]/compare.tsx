import { Stack, useLocalSearchParams } from 'expo-router';

import { MachineGate } from '@/features/machines/MachineGate';
import { SnapshotCompare } from '@/features/machines/SnapshotCompare';
import { useSnapshots } from '@/features/machines/snapshots';

export default function CompareSnapshotsRoute() {
  const { id = '', from, to } = useLocalSearchParams<{ id: string; from?: string; to?: string }>();
  const { data: snapshots = [] } = useSnapshots(id);
  // Opened without a pair: the previous snapshot against the latest.
  const fromId = from ?? snapshots[1]?.id ?? '';
  const toId = to ?? snapshots[0]?.id ?? '';
  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `Compare · ${machine.label}` }} />
          <SnapshotCompare machineId={machine.id} from={fromId} to={toId} />
        </>
      )}
    </MachineGate>
  );
}
