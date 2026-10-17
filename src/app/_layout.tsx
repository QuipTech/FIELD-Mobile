import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

import { configureAmplify } from '@/auth/amplify';
import { hydrateSession, listenForAuthEvents, useSession } from '@/auth/session';
import { BrandSplash } from '@/features/splash/BrandSplash';
import { AppProviders } from '@/providers/AppProviders';
import { authHeaderOptions, detailHeaderOptions, stackScreenOptions, useAppFonts } from '@/theme';

/** Signed-in screens pushed over the tabs (white header, back button, no tab bar). */
const DETAIL_SCREENS = {
  billing: 'Billing & subscription',
  upgrade: 'Upgrade plan',
  'machine-history': 'My machine history',
  'ai-history': 'AI history',
  'help/index': 'Help & support',
  'help/[id]': 'FAQ',
  'case/[id]': 'Case', // the screen sets "Case #1042" and its status pill
  'notifications/index': 'Notifications',
  'notifications/[id]': 'Notification',
  // The machine screens set their titles, e.g. "History · HT-2201".
  'machine/[id]/index': 'Machine',
  'machine/[id]/history': 'History',
  'machine/[id]/configuration': 'Configuration',
  'machine/[id]/manuals': 'Manuals',
  'document/[id]': 'Document',
};

/** Camera screens cover the whole app and draw their own top bar. */
const CAMERA_SCREEN = {
  headerShown: false,
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
} as const;

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
            {Object.entries(DETAIL_SCREENS).map(([name, title]) => (
              <Stack.Screen key={name} name={name} options={detailHeaderOptions(title)} />
            ))}
            <Stack.Screen name="scan" options={CAMERA_SCREEN} />
            <Stack.Screen name="capture" options={CAMERA_SCREEN} />
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
