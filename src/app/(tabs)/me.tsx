import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { refreshAccess, useAccess } from '@/auth/access';
import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { useRole } from '@/auth/useRole';
import { OptionSheet, toast } from '@/components';
import { errorMessage } from '@/lib/http';
import { resetPortalGuide } from '@/features/home/guideStorage';
import { useTeamSummary, useUpdateProfile } from '@/features/me/api';
import { BiometricSheet } from '@/features/me/BiometricSheet';
import { useBiometricSetting } from '@/features/me/useBiometricSetting';
import { LANGUAGE_CODES, languageName, useMeData } from '@/features/me/useMeData';
import { useNotificationPrefs, useSaveNotificationPrefs } from '@/features/notifications/api';
import { useOutbox } from '@/offline/outbox';
import { Me } from '@/features/me/Me';
import type { MeDestination } from '@/features/me/MeSections';

const ROUTES = {
  billing: '/billing',
  team: '/team',
  aiHistory: '/ai-history',
  downloads: '/offline-sync',
  sync: '/offline-sync',
  cases: '/cases',
} as const satisfies Partial<Record<MeDestination, Href>>;

function confirmSignOut() {
  const pending = useOutbox.getState().items.length;
  const warning = pending
    ? `${pending} change${pending === 1 ? '' : 's'} haven’t uploaded yet and will be lost.`
    : 'You’ll need to sign in again to use FIELD on this device.';
  Alert.alert('Sign out?', warning, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => runAuth(signOutUser) },
  ]);
}

/** The Me tab: profile and settings (M9). */
export default function MeRoute() {
  const { data: user } = useCurrentUser();
  const { data } = useMeData();
  const { isAdmin, capabilities } = useRole();
  const team = useTeamSummary(capabilities.isOrganisationAdmin);
  const [pickingLanguage, setPickingLanguage] = useState(false);
  const biometric = useBiometricSetting(user?.email);
  const language = useAccess((s) => s.profile?.language ?? 'en');
  const updateProfile = useUpdateProfile(() => refreshAccess());
  const prefs = useNotificationPrefs();
  const savePrefs = useSaveNotificationPrefs();
  const togglePush = (on: boolean) => {
    const current = prefs.data ?? { pushEnabled: true, emailEnabled: true, mutedKinds: [] };
    savePrefs.mutate(
      { ...current, pushEnabled: on },
      { onError: (e) => toast.show(errorMessage(e)) },
    );
  };

  const onNavigate = async (to: MeDestination) => {
    if (to in ROUTES) return router.push(ROUTES[to as keyof typeof ROUTES]);
    if (to === 'signOut') return confirmSignOut();
    if (to === 'replayGuide') {
      if (!user) return;
      await resetPortalGuide(user.id);
      return toast.show('The guide will show when you open Home.');
    }
    if (to === 'language') setPickingLanguage(true);
  };

  return (
    <>
      <Me
        name={user ? `${user.firstName} ${user.lastName}`.trim() : ''}
        email={user?.email ?? ''}
        initials={user ? initials(user) : ''}
        data={data}
        isAdmin={isAdmin}
        team={capabilities.isOrganisationAdmin ? team.data : undefined}
        version={Constants.expoConfig?.version ?? ''}
        notificationsOn={prefs.data?.pushEnabled ?? true}
        onToggleNotifications={togglePush}
        biometric={biometric.row}
        onNavigate={onNavigate}
      />
      <OptionSheet<string>
        title={pickingLanguage ? 'Language' : undefined}
        options={LANGUAGE_CODES.map((code) => ({ value: code, label: languageName(code) }))}
        value={language}
        onChange={(code) =>
          code &&
          updateProfile.mutate({ language: code }, { onError: (e) => toast.show(errorMessage(e)) })
        }
        onClose={() => setPickingLanguage(false)}
      />
      <BiometricSheet {...biometric.sheet} />
    </>
  );
}
