import { router } from 'expo-router';

import { useAccess } from '@/auth/access';
import { useRole } from '@/auth/useRole';
import { toast } from '@/components';
import { useFeature } from '@/features/billing/entitlements';
import { useMachines } from '@/features/machines/api';
import { MachinesList } from '@/features/machines/MachinesList';

export default function MachinesRoute() {
  const query = useMachines();
  const { isAdmin, capabilities } = useRole();
  const mySite = useAccess((s) => s.profile?.site);
  // Registering machines is a plan feature as well as a permission.
  const canRegister = useFeature('fleet.register');
  return (
    <MachinesList
      machines={query.data ?? []}
      homeSite={mySite ?? 'all'}
      loading={query.isPending && !query.error}
      error={query.data ? undefined : query.error}
      onRetry={() => query.refetch()}
      onScan={() => router.push('/scan')}
      isAdmin={isAdmin || capabilities.canManageMachines}
      onAddMachine={
        capabilities.canManageMachines && canRegister
          ? () => router.push('/add-machine')
          : undefined
      }
      onNearMe={() => toast.show('Sorting by distance is coming soon.')}
      onOpenMachine={(id) => router.push({ pathname: '/machine/[id]', params: { id } })}
    />
  );
}
