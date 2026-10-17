import { router, Stack, useLocalSearchParams } from 'expo-router';

import { Pill, toast } from '@/components';
import { useCases } from '@/features/cases/data';
import { MACHINE_STATUS, useMachine } from '@/features/machines/data';
import { MachineDetail } from '@/features/machines/MachineDetail';
import { MachineNotFound, manualActions } from '@/features/machines/MachineParts';
import { useMachineRecords } from '@/features/machines/records';

const SECTIONS = {
  history: '/machine/[id]/history',
  configuration: '/machine/[id]/configuration',
  manuals: '/machine/[id]/manuals',
} as const;

export default function MachineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const machine = useMachine(id);
  const records = useMachineRecords(id);
  const { data: cases } = useCases();
  if (!machine) return <MachineNotFound />;
  const status = MACHINE_STATUS[machine.status];

  return (
    <>
      <Stack.Screen
        options={{
          title: machine.id,
          headerRight: () => <Pill label={status.label} tone={status.tone} />,
        }}
      />
      <MachineDetail
        machine={machine}
        records={records}
        cases={cases.filter((c) => c.machine.id === machine.id)}
        onAskAi={() => router.navigate({ pathname: '/ask-ai', params: { machine: machine.id } })}
        onLogEntry={() => router.push({ pathname: '/capture', params: { machineId: machine.id } })}
        onOpenComponent={() => toast.show('Component details are coming soon.')}
        onSeeAll={(section) =>
          router.push({ pathname: SECTIONS[section], params: { id: machine.id } })
        }
        onOpenCase={(caseId) => router.push({ pathname: '/case/[id]', params: { id: caseId } })}
        {...manualActions}
      />
    </>
  );
}
