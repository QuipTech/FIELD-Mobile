import { Stack, useLocalSearchParams } from 'expo-router';

import { MachineGate } from '@/features/machines/MachineGate';
import { useManualActions } from '@/features/machines/manualsApi';
import { MachineManuals } from '@/features/machines/Manuals';
import { useMachineRecords } from '@/features/machines/records';

export default function MachineManualsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { manuals } = useMachineRecords(id);
  const actions = useManualActions(id);
  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `Manuals · ${machine.label}` }} />
          <MachineManuals manuals={manuals} {...actions} />
        </>
      )}
    </MachineGate>
  );
}
