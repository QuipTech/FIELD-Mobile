import type { ReactNode } from 'react';

import { EmptyState, type EmptyStateProps } from '../EmptyState/EmptyState';
import { ErrorState } from '../ErrorState/ErrorState';
import { SkeletonList } from '../Skeleton/SkeletonList';

/** Minimal slice of a TanStack Query result, so this stays decoupled from the library. */
export type AsyncResult<T> = {
  data: T | undefined;
  error: unknown;
  isPending: boolean;
  isRefetching?: boolean;
  refetch: () => unknown;
};

export type AsyncContentProps<T> = {
  query: AsyncResult<T>;
  isEmpty?: (data: T) => boolean;
  empty: EmptyStateProps;
  loading?: ReactNode;
  children: (data: T) => ReactNode;
};

/**
 * One place for loading / error / empty / data states.
 * Cached data wins over errors, so offline users still see what was saved.
 */
export function AsyncContent<T>({
  query,
  isEmpty,
  empty,
  loading,
  children,
}: AsyncContentProps<T>) {
  if (query.data !== undefined) {
    if (isEmpty?.(query.data)) return <EmptyState {...empty} />;
    return <>{children(query.data)}</>;
  }
  if (query.isPending && !query.error) return <>{loading ?? <SkeletonList />}</>;
  return (
    <ErrorState error={query.error} onRetry={() => query.refetch()} retrying={query.isRefetching} />
  );
}
