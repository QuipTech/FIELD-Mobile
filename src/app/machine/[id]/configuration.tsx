import { Stack, useLocalSearchParams } from 'expo-router';

import { MachineNotFound } from '@/features/machines/MachineParts';
import { useMachine } from '@/features/machines/data';
import { useMachineRecords } from '@/features/machines/records';
import { ConfigurationTimeline } from '@/features/machines/Timelines';

export default function MachineConfigurationRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const machine = useMachine(id);
  const { configuration } = useMachineRecords(id);
  if (!machine) return <MachineNotFound />;
  return (
    <>
      <Stack.Screen options={{ title: `Configuration · ${machine.id}` }} />
      <ConfigurationTimeline changes={configuration} />
    </>
  );
}
