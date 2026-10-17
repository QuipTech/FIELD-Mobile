import { Stack, useLocalSearchParams } from 'expo-router';

import { MachineNotFound, manualActions } from '@/features/machines/MachineParts';
import { useMachine } from '@/features/machines/data';
import { MachineManuals } from '@/features/machines/Manuals';
import { useMachineRecords } from '@/features/machines/records';

export default function MachineManualsRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const machine = useMachine(id);
  const { manuals } = useMachineRecords(id);
  if (!machine) return <MachineNotFound />;
  return (
    <>
      <Stack.Screen options={{ title: `Manuals · ${machine.id}` }} />
      <MachineManuals manuals={manuals} {...manualActions} />
    </>
  );
}
