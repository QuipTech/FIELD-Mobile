import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useRole } from '@/auth/useRole';
import { ConfigurationHistory } from '@/features/machines/ConfigurationHistory';
import { MachineGate } from '@/features/machines/MachineGate';
import { orderPair, useSnapshots } from '@/features/machines/snapshots';

export default function MachineConfigurationRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { can } = useRole();
  const [selected, setSelected] = useState<string[]>([]);
  const { data: snapshots = [] } = useSnapshots(id);

  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `Configuration · ${machine.label}` }} />
          <ConfigurationHistory
            machineId={machine.id}
            selected={selected}
            onSelect={setSelected}
            canTake={can('history.create')}
            canManage={can('machine.manage')}
            onCompare={(a, b) => {
              const [from, to] = orderPair(snapshots, a, b);
              router.push({
                pathname: '/machine/[id]/compare',
                params: { id: machine.id, from, to },
              });
            }}
          />
        </>
      )}
    </MachineGate>
  );
}
