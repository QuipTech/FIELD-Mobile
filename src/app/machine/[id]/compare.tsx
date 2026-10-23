import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Screen } from '@/components';
import { CompareSnapshots } from '@/features/machines/CompareSnapshots';
import { MachineGate } from '@/features/machines/MachineGate';
import { useSnapshotDiff, useSnapshots } from '@/features/machines/snapshots';

export default function CompareSnapshotsRoute() {
  const { id, from, to } = useLocalSearchParams<{ id: string; from?: string; to?: string }>();
  const { data: changes = [] } = useSnapshots(id);
  // Default: the previous snapshot against the latest.
  const fromId = from ?? changes[1]?.id ?? '';
  const toId = to ?? changes[0]?.id ?? '';
  const diff = useSnapshotDiff(id, fromId, toId);
  return (
    <MachineGate id={id}>
      {(machine) => (
        <Screen>
          <Stack.Screen options={{ title: `Compare · ${machine.label}` }} />
          <CompareSnapshots
            changes={changes}
            fromId={fromId}
            toId={toId}
            sections={diff.data}
            loading={diff.isFetching && !diff.data}
            error={diff.data ? undefined : diff.error}
            onRetry={() => diff.refetch()}
            onChange={(f, t) => router.setParams({ from: f, to: t })}
          />
        </Screen>
      )}
    </MachineGate>
  );
}
