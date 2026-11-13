import { Lock } from 'lucide-react-native';

import { Button } from '@/components/Button/Button';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { ApiError, errorMessage } from '@/lib/http';
import { useLifecycle } from './lifecycleApi';
import { useLifecycleActions } from './LifecycleSheets';

/**
 * For features only active machines get: a 403/409 shows the server's message and, when this user
 * may activate the machine, the Activate action. Other errors get the usual retry.
 */
export function NotActive({
  machineId,
  error,
  onRetry,
}: {
  machineId: string;
  error: unknown;
  onRetry: () => void;
}) {
  const gated = error instanceof ApiError && (error.status === 403 || error.status === 409);
  const lifecycle = useLifecycle(gated ? machineId : undefined);
  const actions = useLifecycleActions(machineId);
  if (!gated) return <ErrorState error={error} onRetry={onRetry} />;
  const canActivate = lifecycle.data?.availableActions.includes('activate');
  return (
    <>
      <EmptyPanel
        icon={Lock}
        title="Not available for this machine"
        message={errorMessage(error)}
        action={canActivate ? undefined : { label: 'Try again', onPress: onRetry }}
      />
      {canActivate && <Button label="Activate machine" onPress={() => actions.run('activate')} />}
      {actions.sheets}
    </>
  );
}
