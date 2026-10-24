import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useEffect, useState } from 'react';

import { startAccessSync } from '@/auth/access';
import { configureAmplify } from '@/auth/amplify';
import { registerApiTokenProvider } from '@/auth/apiSession';
import { startBiometricSync } from '@/auth/biometrics';
import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { hydrateSession, listenForAuthEvents, useSession } from '@/auth/session';
import { hydrateOnboarding, useOnboarding } from '@/features/onboarding/onboardingStorage';
import { BrandSplash } from '@/features/splash/BrandSplash';
import { startOutboxSync } from '@/offline/sync';
import { AppProviders } from '@/providers/AppProviders';
import { hydrateThemePreference, useAppFonts, useNavigationOptions } from '@/theme';

/** Signed-in screens pushed over the tabs (header with back button, no tab bar). */
const DETAIL_SCREENS = {
  cases: 'Cases',
  billing: 'Billing & plan',
  'offline-sync': 'Offline & sync',
  'ai-history': 'AI history',
  'ai-review/[id]': 'Flagged answer',
  'case/[id]': 'Case', // the screen sets "#1042 …"
  'new-case': 'New case',
  'add-machine': 'Add machine',
  team: 'Team & roles',
  'team-invite': 'Invite',
  'notifications/index': 'Notifications',
  // The machine screens set their own titles.
  'machine/[id]/index': 'Machine',
  'machine/[id]/history': 'History',
  'machine/[id]/configuration': 'Configuration',
  'machine/[id]/manuals': 'Manuals',
  'document/[id]': 'Document',
  'knowledge/brand/[id]': 'Knowledge',
  'knowledge/category/[id]': 'Category',
  'machine/[id]/compare': 'Compare snapshots',
  'machine/[id]/edit': 'Edit machine',
  'machine/[id]/system/[systemId]': 'Components',
};

/** Camera screens cover the whole app and draw their own top bar. */
const CAMERA_SCREEN = {
  headerShown: false,
  presentation: 'fullScreenModal',
  animation: 'slide_from_bottom',
} as const;
const BARE = { headerShown: false } as const;
const FADE = { headerShown: false, animation: 'fade' } as const;

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureAmplify();

export default function RootLayout() {
  return (
    <AppProviders>
      <RootStack />
    </AppProviders>
  );
}

function RootStack() {
  const { loaded, error } = useAppFonts();
  const [themeLoaded, setThemeLoaded] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
  const finishSplash = useCallback(() => setSplashDone(true), []);
  const status = useSession((s) => s.status);
  const onboardingSeen = useOnboarding((s) => s.seen);
  const nav = useNavigationOptions();
  // Wait for fonts, the theme setting, the onboarding flag and the stored session, so the first
  // screen is right.
  const ready =
    (loaded || !!error) && themeLoaded && onboardingSeen !== null && status !== 'unknown';

  useEffect(() => {
    // API requests carry the API session's token; if it can't be renewed, sign out.
    registerApiTokenProvider(() => runAuth(signOutUser));
    hydrateThemePreference().finally(() => setThemeLoaded(true));
    hydrateOnboarding();
    hydrateSession();
    const stopAccess = startAccessSync();
    const stopBiometrics = startBiometricSync();
    const stopOutbox = startOutboxSync();
    const stopAuth = listenForAuthEvents();
    return () => {
      stopAccess();
      stopBiometrics();
      stopOutbox();
      stopAuth();
    };
  }, []);

  // BrandSplash hides the native splash once laid out, then fades when ready.
  // Signed-out users land on onboarding the first time, then on sign-in (the first available
  // screen when `index` is guarded).
  return (
    <>
      {ready && (
        <Stack screenOptions={nav.stack}>
          <Stack.Protected guard={status === 'signedIn'}>
            <Stack.Screen name="(tabs)" options={BARE} />
            {Object.entries(DETAIL_SCREENS).map(([name, title]) => (
              <Stack.Screen key={name} name={name} options={nav.header(title)} />
            ))}
            <Stack.Screen name="scan" options={CAMERA_SCREEN} />
            <Stack.Screen name="capture" options={CAMERA_SCREEN} />
            <Stack.Screen name="capture-photo" options={CAMERA_SCREEN} />
            <Stack.Screen name="knowledge/search" options={FADE} />
          </Stack.Protected>
          <Stack.Protected guard={status === 'profileRequired'}>
            <Stack.Screen name="complete-profile" options={BARE} />
          </Stack.Protected>
          <Stack.Protected guard={status === 'signedOut'}>
            <Stack.Protected guard={!onboardingSeen}>
              <Stack.Screen name="onboarding" options={FADE} />
            </Stack.Protected>
            <Stack.Screen name="sign-in" options={FADE} />
            <Stack.Screen name="register" options={nav.authHeader('Create account')} />
            <Stack.Screen name="forgot-password" options={nav.backOnly} />
            <Stack.Screen name="reset-code" options={BARE} />
            <Stack.Screen name="new-password" options={BARE} />
            <Stack.Screen name="verify-email" options={BARE} />
            <Stack.Screen name="two-factor" options={nav.authHeader('Verify it’s you')} />
          </Stack.Protected>
          {/* Google/Apple return links (Android delivers them as deep links). Must stay after the
              guarded groups: a signed-out launch redirects to the FIRST available screen. */}
          <Stack.Screen name="auth/[step]" options={{ headerShown: false, animation: 'none' }} />
        </Stack>
      )}
      {!splashDone && <BrandSplash ready={ready} onFinish={finishSplash} />}
    </>
  );
}
