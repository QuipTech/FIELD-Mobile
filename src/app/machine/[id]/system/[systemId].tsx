import { Stack, useLocalSearchParams } from 'expo-router';

import { SystemComponents } from '@/features/machines/Components';
import { useSystemComponents } from '@/features/machines/componentsApi';
import { MachineGate } from '@/features/machines/MachineGate';

export default function MachineSystemRoute() {
  const { id, systemId } = useLocalSearchParams<{ id: string; systemId: string }>();
  const { data: components = [] } = useSystemComponents(id, systemId);
  const systemName = components[0]?.systemName ?? 'Components';

  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `${systemName} · ${machine.label}` }} />
          <SystemComponents components={components} />
        </>
      )}
    </MachineGate>
  );
}
