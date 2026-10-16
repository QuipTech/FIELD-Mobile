import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

import { configureAmplify } from '@/auth/amplify';
import { hydrateSession, listenForAuthEvents, useSession } from '@/auth/session';
import { BrandSplash } from '@/features/splash/BrandSplash';
import { AppProviders } from '@/providers/AppProviders';
import { authHeaderOptions, stackScreenOptions, useAppFonts } from '@/theme';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureAmplify();

export default function RootLayout() {
  const { loaded, error } = useAppFonts();
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  const status = useSession((s) => s.status);
  const signedIn = status === 'signedIn';
  // Wait for fonts and the stored Cognito session, so the first screen is the right one.
  const ready = (loaded || !!error) && status !== 'unknown';

  useEffect(() => {
    hydrateSession();
    return listenForAuthEvents();
  }, []);

  // BrandSplash renders immediately and hides the native splash once it is laid out
  // (identical logo card position), then fades out when fonts are ready.
  // Signed-out users land on onboarding (first available screen when `index` is guarded).
  return (
    <AppProviders>
      {ready && (
        <Stack screenOptions={stackScreenOptions}>
          <Stack.Protected guard={signedIn}>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack.Protected>
          <Stack.Protected guard={!signedIn}>
            <Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="sign-in" options={{ headerShown: false, animation: 'fade' }} />
            <Stack.Screen name="register" options={authHeaderOptions('Create your account')} />
            <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
            <Stack.Screen name="reset-code" options={{ headerShown: false }} />
            <Stack.Screen name="new-password" options={{ headerShown: false }} />
            <Stack.Screen name="verify-email" options={{ headerShown: false }} />
            <Stack.Screen name="two-factor" options={authHeaderOptions('Secure your account')} />
          </Stack.Protected>
          {/* Google/Apple return links (Android delivers them as deep links). Must stay after the
              guarded groups: a signed-out launch redirects to the FIRST available screen. */}
          <Stack.Screen name="auth/[step]" options={{ headerShown: false, animation: 'none' }} />
        </Stack>
      )}
      {!splashDone && <BrandSplash ready={ready} onFinish={finishSplash} />}
    </AppProviders>
  );
}
