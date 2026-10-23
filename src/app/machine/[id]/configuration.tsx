import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert } from 'react-native';

import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { MachineGate } from '@/features/machines/MachineGate';
import { useRestoreSnapshot, useSnapshots } from '@/features/machines/snapshots';
import { ConfigurationTimeline } from '@/features/machines/Timelines';
import { errorMessage } from '@/lib/http';

export default function MachineConfigurationRoute() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { capabilities } = useRole();
  const snapshots = useSnapshots(id);
  const restore = useRestoreSnapshot(id);
  const changes = snapshots.data ?? [];
  // Restore goes back to the latest known-good snapshot, else the one before the current.
  const target = changes.slice(1).find((c) => c.knownGood) ?? changes[1];

  const confirmRestore = (label: string) =>
    target &&
    Alert.alert(
      'Restore a snapshot?',
      `${label}'s recorded serial, firmware and software go back to “${target.title}”. Later snapshots stay in the history.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          onPress: () =>
            restore.mutate(target.id, {
              onSuccess: () => toast.show('Configuration restored.'),
              onError: (e) => toast.show(errorMessage(e)),
            }),
        },
      ],
    );

  return (
    <MachineGate id={id}>
      {(machine) => (
        <>
          <Stack.Screen options={{ title: `Configuration · ${machine.label}` }} />
          <ConfigurationTimeline
            changes={changes}
            onCompare={() =>
              router.push({ pathname: '/machine/[id]/compare', params: { id: machine.id } })
            }
            onRestore={
              capabilities.canManageMachines && target
                ? () => confirmRestore(machine.label)
                : undefined
            }
          />
        </>
      )}
    </MachineGate>
  );
}
