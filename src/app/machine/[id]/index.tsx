import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { View } from 'react-native';

import { useRole } from '@/auth/useRole';
import { IconButton, Pill, toast } from '@/components';
import { useCases } from '@/features/cases/api';
import { MACHINE_STATUS } from '@/features/machines/data';
import { MachineDetail } from '@/features/machines/MachineDetail';
import { MachineGate } from '@/features/machines/MachineGate';
import { useManualActions } from '@/features/machines/manualsApi';
import { useMachineRecords } from '@/features/machines/records';

const SECTIONS = {
  history: '/machine/[id]/history',
  configuration: '/machine/[id]/configuration',
  manuals: '/machine/[id]/manuals',
} as const;

export default function MachineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const records = useMachineRecords(id);
  const { data: cases = [] } = useCases();
  const { capabilities } = useRole();
  const canManage = capabilities.canManageMachines;
  const manualActions = useManualActions(id);

  return (
    <MachineGate id={id}>
      {(machine) => {
        const status = MACHINE_STATUS[machine.status];
        return (
          <>
            <Stack.Screen
              options={{
                title: machine.label,
                headerRight: () => (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Pill label={status.label} tone={status.tone} />
                    {canManage && (
                      <IconButton
                        icon={Pencil}
                        accessibilityLabel="Edit machine"
                        onPress={() =>
                          router.push({
                            pathname: '/machine/[id]/edit',
                            params: { id: machine.id },
                          })
                        }
                      />
                    )}
                  </View>
                ),
              }}
            />
            <MachineDetail
              machine={machine}
              records={records}
              isAdmin={canManage}
              technicians={machine.technicianCount}
              cases={cases.filter((c) => c.machine?.id === machine.id)}
              onAskAi={() =>
                router.navigate({ pathname: '/ask-ai', params: { machine: machine.id } })
              }
              onLogEntry={() =>
                router.push({ pathname: '/capture', params: { machineId: machine.id } })
              }
              onOpenComponent={() => toast.show('Component details are coming soon.')}
              onSeeAll={(section) =>
                router.push({ pathname: SECTIONS[section], params: { id: machine.id } })
              }
              onOpenCase={(caseId) =>
                router.push({ pathname: '/case/[id]', params: { id: caseId } })
              }
              {...manualActions}
            />
          </>
        );
      }}
    </MachineGate>
  );
}
