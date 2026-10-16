import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner, ToastHost } from '@/components';
import { queryClient } from '@/lib/queryClient';

/** App-wide providers and overlays. Auth/session provider joins in Step 2. */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <OfflineBanner />
        {children}
        <ToastHost />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
