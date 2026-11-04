import { Alert } from 'react-native';

import { useOutbox } from '@/offline/outbox';
import { signOutUser } from './flows';
import { runAuth } from './runAuth';

/** Shared sign-out confirmation, including changes that would be lost. */
export function confirmSignOut() {
  const pending = useOutbox.getState().items.length;
  const warning = pending
    ? `${pending} change${pending === 1 ? '' : 's'} haven’t uploaded yet and will be lost.`
    : 'You’ll need to sign in again to use FIELD on this device.';
  Alert.alert('Sign out?', warning, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign out', style: 'destructive', onPress: () => runAuth(signOutUser) },
  ]);
}
