import { router } from 'expo-router';
import { useState } from 'react';

import { useAccess } from '@/auth/access';
import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { useFeature } from '@/features/billing/entitlements';
import { machineKeys, useMachines } from '@/features/machines/api';
import { MachinesList } from '@/features/machines/MachinesList';
import { usePullRefresh } from '@/lib/usePullRefresh';

export default function MachinesRoute() {
  const groups = useAccess((s) => s.accessibleGroups);
  const [groupId, setGroupId] = useState<string>();
  // A group that's no longer shared falls back to the whole fleet.
  const activeGroup = groups.some((g) => g.id === groupId) ? groupId : undefined;
  const query = useMachines(activeGroup);
  const refresh = usePullRefresh(machineKeys.all);
  const { isAdmin, capabilities, can } = useRole();
  const mySite = useAccess((s) => s.profile?.site);
  // Registering machines is a plan feature as well as a permission.
  const canRegister = useFeature('fleet.register');
  return (
    <MachinesList
      {...refresh}
      machines={query.data ?? []}
      homeSite={mySite ?? 'all'}
      loading={query.isPending && !query.error}
      error={query.data ? undefined : query.error}
      onRetry={() => query.refetch()}
      onScan={() => router.push('/scan')}
      isAdmin={isAdmin || capabilities.canManageMachines}
      onAddMachine={
        // `machine.create` is what POST /machines checks (the portal's "Add machine" rule).
        can('machine.create') && canRegister ? () => router.push('/add-machine') : undefined
      }
      onNearMe={() => toast.show('Sorting by distance is coming soon.')}
      onOpenMachine={(id) => router.push({ pathname: '/machine/[id]', params: { id } })}
      groups={groups}
      groupId={activeGroup}
      onGroup={setGroupId}
    />
  );
}
