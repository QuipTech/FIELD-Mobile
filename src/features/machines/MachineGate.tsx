import type { ReactNode } from 'react';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { ApiError } from '@/lib/http';
import { useMachine } from './api';
import type { Machine } from './data';
import { MachineNotFound } from './MachineParts';

/**
 * Loads a machine for a machine screen: skeleton while loading, "Machine not found" for an id
 * the API doesn't know (404, or 400 for a malformed id), otherwise an error with retry.
 */
export function MachineGate({
  id,
  children,
}: {
  id: string | undefined;
  children: (machine: Machine) => ReactNode;
}) {
  const query = useMachine(id);
  if (query.data) return <>{children(query.data)}</>;
  if (!id || (query.error instanceof ApiError && [400, 404].includes(query.error.status))) {
    return <MachineNotFound />;
  }
  if (query.isPending && !query.error) {
    return (
      <DetailScreen>
        <SkeletonList />
      </DetailScreen>
    );
  }
  return (
    <DetailScreen>
      <ErrorState
        error={query.error}
        onRetry={() => query.refetch()}
        retrying={query.isRefetching}
      />
    </DetailScreen>
  );
}
