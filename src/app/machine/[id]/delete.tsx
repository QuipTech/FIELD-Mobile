import { Stack, useLocalSearchParams } from 'expo-router';

import { NoAccess } from '@/components';
import { useRole } from '@/auth/useRole';
import { DeleteMachine } from '@/features/machines/DeleteMachine';
import { MachineGate } from '@/features/machines/MachineGate';

export default function DeleteMachineRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { can } = useRole();
  if (!can('machine.lifecycle')) return <NoAccess />;
  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `Delete · ${machine.label}` }} />
          <DeleteMachine machineId={machine.id} label={machine.label} />
        </>
      )}
    </MachineGate>
  );
}
