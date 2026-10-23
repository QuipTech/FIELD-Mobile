import { CircleAlert, WifiOff } from 'lucide-react-native';

import { ApiError, NetworkError, errorMessage } from '@/lib/http';
import { EmptyState, type StateAction } from '../EmptyState/EmptyState';
import { NoAccess } from '../NoAccess/NoAccess';

export type ErrorStateProps = {
  error?: unknown;
  title?: string;
  onRetry?: () => void;
  /** Spinner on Retry while the query re-runs. */
  retrying?: boolean;
  /** Where a 403 sends the user, e.g. "Go to Knowledge". */
  noAccessAction?: StateAction;
};

/**
 * Error with Retry for lists and screens with nothing cached. A 403 shows NoAccess; a lost
 * connection shows the offline variant. Never throws, whatever `error` is.
 */
export function ErrorState({ error, title, onRetry, retrying, noAccessAction }: ErrorStateProps) {
  if (error instanceof ApiError && error.isForbidden) {
    return <NoAccess primaryAction={noAccessAction} />;
  }
  const offline = error instanceof NetworkError && !error.isTimeout;
  const retry = onRetry ? { label: 'Retry', onPress: onRetry, loading: retrying } : undefined;
  return (
    <EmptyState
      icon={offline ? WifiOff : CircleAlert}
      tone={offline ? 'neutral' : 'danger'}
      title={title ?? (offline ? "You're offline" : "Couldn't load this")}
      message={
        offline
          ? "This isn't saved on this device yet. Reconnect and try again."
          : errorMessage(error)
      }
      action={retry}
      testID="error-state"
    />
  );
}
