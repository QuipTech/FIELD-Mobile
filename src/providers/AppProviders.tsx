import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, type ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner, ToastHost } from '@/components';
import { queryClient } from '@/lib/queryClient';
import { navigationTheme, useTheme } from '@/theme';

/** App-wide providers and overlays: gestures, sheets, data, theme, connection and toasts. */
export function AppProviders({ children }: { children: ReactNode }) {
  const { scheme, colors } = useTheme();
  const theme = useMemo(() => navigationTheme(scheme), [scheme]);
  return (
    <GestureHandlerRootView style={[styles.root, { backgroundColor: colors.bg }]}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value={theme}>
            <BottomSheetModalProvider>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <OfflineBanner />
              {children}
              <ToastHost />
            </BottomSheetModalProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });
