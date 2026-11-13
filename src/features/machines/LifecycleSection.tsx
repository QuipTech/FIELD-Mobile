import { router } from 'expo-router';

import { useRole } from '@/auth/useRole';
import { useLifecycle } from './lifecycleApi';
import { LifecycleCard } from './LifecycleCard';
import { useLifecycleActions } from './LifecycleSheets';

/** Lifecycle and billing card on machine detail, with its confirmation sheets. */
export function LifecycleSection({ machineId }: { machineId: string }) {
  const { can } = useRole();
  const lifecycle = useLifecycle(machineId);
  const actions = useLifecycleActions(machineId);
  if (!lifecycle.data) return null;
  return (
    <>
      <LifecycleCard
        info={lifecycle.data}
        busy={actions.busy}
        onAction={actions.run}
        onDelete={
          can('machine.lifecycle')
            ? () => router.push({ pathname: '/machine/[id]/delete', params: { id: machineId } })
            : undefined
        }
      />
      {actions.sheets}
    </>
  );
}
