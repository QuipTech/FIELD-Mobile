import { QueryClient, focusManager, onlineManager } from '@tanstack/react-query';
import { AppState, Platform, type AppStateStatus } from 'react-native';

import { ApiError } from './http';
import { subscribeOnline } from './network';

// Let TanStack Query pause/resume based on real connectivity.
onlineManager.setEventListener((setOnline) => subscribeOnline(setOnline));

// Refetch stale queries when the app returns to the foreground.
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') focusManager.setFocused(status === 'active');
}
AppState.addEventListener('change', onAppStateChange);

function shouldRetry(failureCount: number, error: unknown): boolean {
  // 4xx are final (403 is the source of truth for permissions); 401 is handled by the http client.
  if (error instanceof ApiError && error.status < 500 && error.status !== 408) return false;
  return failureCount < 2;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 24 * 60 * 60 * 1000, // keep long enough for offline persistence (Step 5)
      retry: shouldRetry,
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: false, // writes go through the offline outbox (Step 5)
      networkMode: 'offlineFirst',
    },
  },
});
