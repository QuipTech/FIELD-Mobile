import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Pencil } from 'lucide-react-native';
import { View } from 'react-native';

import { useRole } from '@/auth/useRole';
import { usePullRefresh } from '@/lib/usePullRefresh';
import { IconButton, Pill } from '@/components';
import { useCases } from '@/features/cases/api';
import { MACHINE_STATUS } from '@/features/machines/data';
import { MachineDetail } from '@/features/machines/MachineDetail';
import { LifecycleSection } from '@/features/machines/LifecycleSection';
import { useMachine } from '@/features/machines/api';
import { MachineGate } from '@/features/machines/MachineGate';
import { useOpenManuals } from '@/features/machines/useOpenManuals';
import { useManualActions } from '@/features/machines/manualsApi';
import { useMachineRecords } from '@/features/machines/records';

const SECTIONS = {
  history: '/machine/[id]/history',
  configuration: '/machine/[id]/configuration',
  manuals: '/machine/[id]/manuals',
} as const;

const openEdit = (id: string) => router.push({ pathname: '/machine/[id]/edit', params: { id } });

export default function MachineRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const records = useMachineRecords(id);
  const { data: cases = [] } = useCases();
  const { capabilities, can } = useRole();
  const pull = usePullRefresh(['machines', id]);
  const canManage = capabilities.canManageMachines;
  const manualActions = useManualActions(id);
  const openManuals = useOpenManuals(useMachine(id).data);

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
                        onPress={() => openEdit(machine.id)}
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
              lifecycle={<LifecycleSection machineId={machine.id} />}
              canUploadDocuments={can('history.create') && machine.lifecycle !== 'sold'}
              canManage={can('machine.manage')}
              {...pull}
              cases={cases.filter((c) => c.machine?.id === machine.id)}
              onAskAi={() =>
                router.navigate({ pathname: '/ask-ai', params: { machine: machine.id } })
              }
              onLogEntry={() =>
                router.push({ pathname: '/capture', params: { machineId: machine.id } })
              }
              onAddPhotos={(entry) =>
                router.push({
                  pathname: '/capture-photo',
                  params: { machineId: machine.id, entryId: entry.id },
                })
              }
              onOpenComponent={(systemId) =>
                router.push({
                  pathname: '/machine/[id]/system/[systemId]',
                  params: { id: machine.id, systemId },
                })
              }
              onSeeAll={(section) =>
                section === 'manuals'
                  ? openManuals()
                  : router.push({ pathname: SECTIONS[section], params: { id: machine.id } })
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
