import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { z } from 'zod';

import { useSession } from '@/auth/session';
import { http } from '@/lib/http';
import { log } from '@/lib/log';

/**
 * Push device registration (Push Notifications Integration Guide). The app sends the raw
 * native token (FCM on Android, APNs on iOS) to `POST /me/devices`; the backend delivers
 * through SNS. The app never talks to SNS itself.
 */

/** The `id` from `POST /me/devices`, needed to remove this device on sign-out. */
const DEVICE_KEY = 'fieldPushDevice';
export const ANDROID_CHANNEL = 'default';

const device = z.object({ id: z.string() }).loose();

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    // Android 13+ shows the permission prompt only once a channel exists.
    await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL, {
      name: 'Notifications',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/**
 * Token registered (or being registered) in this app session. Fetching the token also fires
 * the token listener, so both paths ask for the same token on every launch.
 */
let registered: { token: string; done: Promise<void> } | null = null;

/** Re-sending the same token is safe (the API refreshes the record), but needless. */
function registerToken(pushToken: string): Promise<void> {
  if (registered?.token === pushToken) return registered.done;
  const done = postToken(pushToken).catch((error) => {
    registered = null; // let the next attempt try again
    throw error;
  });
  registered = { token: pushToken, done };
  return done;
}

async function postToken(pushToken: string) {
  const res = device.parse(
    await http.post('/me/devices', {
      deviceType: Platform.OS === 'ios' ? 'ios' : 'android',
      pushToken,
      appVersion: Constants.expoConfig?.version,
    }),
  );
  await SecureStore.setItemAsync(DEVICE_KEY, res.id);
  log('push', `registered device ${res.id} (token …${pushToken.slice(-6)})`);
}

/** Asks for permission (the first time) and registers this device. Safe to repeat. */
export async function registerForPush() {
  if (Platform.OS === 'web') return;
  try {
    if (!(await ensurePermission())) {
      log('push', 'permission not granted; device not registered');
      return;
    }
    const { data } = await Notifications.getDevicePushTokenAsync();
    await registerToken(String(data));
  } catch (error) {
    // E.g. no Firebase config in this build, or offline: tried again on the next launch.
    log('push', `registration failed: ${String(error)}`);
  }
}

/** Removes this device from the account; call before `/auth/logout`. Best effort. */
export async function unregisterPushDevice() {
  registered = null; // the next user registers this device again
  if (Platform.OS !== 'web') Notifications.setBadgeCountAsync(0).catch(() => undefined);
  const id = await SecureStore.getItemAsync(DEVICE_KEY).catch(() => null);
  if (!id) return;
  // Forgotten first: with an expired session the DELETE's 401 signs out again, and that
  // nested sign-out must find nothing left to delete.
  await SecureStore.deleteItemAsync(DEVICE_KEY).catch(() => undefined);
  await http
    .delete(`/me/devices/${encodeURIComponent(id)}`, { retry: false })
    .catch((error) => log('push', `unregister failed: ${String(error)}`));
}

/**
 * Registers whenever the session becomes signed in (launch with a stored session, or a fresh
 * sign-in) and whenever the OS rolls the token. Returns unsubscribe.
 */
export function startPushSync() {
  if (Platform.OS === 'web') return () => undefined;
  const signedIn = () => useSession.getState().status === 'signedIn';
  if (signedIn()) registerForPush();
  const stopSession = useSession.subscribe((s, prev) => {
    if (s.status === 'signedIn' && prev.status !== 'signedIn') registerForPush();
  });
  const tokens = Notifications.addPushTokenListener(({ data }) => {
    if (!signedIn()) return;
    registerToken(String(data)).catch((error) =>
      log('push', `re-registration failed: ${String(error)}`),
    );
  });
  return () => {
    stopSession();
    tokens.remove();
  };
}
