import Constants from 'expo-constants';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { signOutUser } from '@/auth/flows';
import { runAuth } from '@/auth/runAuth';
import { initials, useCurrentUser } from '@/auth/useCurrentUser';
import { toast } from '@/components';
import { resetPortalGuide } from '@/features/home/guideStorage';
import { useMeData } from '@/features/me/data';
import { Me } from '@/features/me/Me';
import type { MeDestination } from '@/features/me/MeSections';

const ROUTES = {
  billing: '/billing',
  upgrade: '/upgrade',
  machineHistory: '/machine-history',
  aiHistory: '/ai-history',
  help: '/help',
  faqs: '/help',
} as const satisfies Partial<Record<MeDestination, Href>>;

const COMING_SOON: Partial<Record<MeDestination, string>> = {
  downloads: 'Offline downloads',
  sync: 'Sync details',
  language: 'Language settings',
};

function confirmSignOut() {
  Alert.alert('Sign out?', 'You’ll need to sign in again to use FIELD on this device.', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => runAuth(signOutUser) },
  ]);
}

export default function MeRoute() {
  const { data: user } = useCurrentUser();
  const { data, isSample } = useMeData();
  // TODO(api): persist with the notification preferences endpoint once push is set up.
  const [notificationsOn, setNotificationsOn] = useState(true);

  const onNavigate = async (to: MeDestination) => {
    if (to in ROUTES) return router.push(ROUTES[to as keyof typeof ROUTES]);
    if (to === 'signOut') return confirmSignOut();
    if (to === 'replayGuide') {
      if (!user) return;
      await resetPortalGuide(user.id);
      return toast.show('The guide will show when you open Home.');
    }
    toast.show(`${COMING_SOON[to] ?? 'This'} is coming soon.`);
  };

  return (
    <Me
      name={user ? `${user.firstName} ${user.lastName}`.trim() : ''}
      email={user?.email ?? ''}
      initials={user ? initials(user) : ''}
      data={data}
      isSample={isSample}
      version={Constants.expoConfig?.version ?? ''}
      notificationsOn={notificationsOn}
      onToggleNotifications={setNotificationsOn}
      onNavigate={onNavigate}
    />
  );
}
