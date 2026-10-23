import * as SecureStore from 'expo-secure-store';

import { useSession } from './session';

/**
 * The email and password from this session's sign-in, so Me → Security can turn on Face ID /
 * fingerprint with one tap instead of asking for the password again. Kept in the Keychain /
 * Keystore on this device only (like the API session beside it) and deleted when the session
 * ends.
 */

const STORE_KEY = 'fieldSessionCredentials';
type Credentials = { email: string; password: string };

export async function rememberSessionCredentials(email: string, password: string) {
  const credentials: Credentials = { email, password };
  await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(credentials), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  }).catch(() => undefined);
}

/** This session's password for `email`; null if it signed in another way (Google, Apple). */
export async function sessionPassword(email: string): Promise<string | null> {
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    const saved = raw ? (JSON.parse(raw) as Credentials) : null;
    return saved?.email.toLowerCase() === email.toLowerCase() ? saved.password : null;
  } catch {
    return null;
  }
}

export const forgetSessionCredentials = () =>
  SecureStore.deleteItemAsync(STORE_KEY).catch(() => undefined);

/** Deletes them whenever the session ends (sign-out or expiry). Returns unsubscribe. */
export function forgetSessionCredentialsOnSignOut() {
  return useSession.subscribe((s, prev) => {
    if (s.status === 'signedOut' && prev.status !== 'signedOut') forgetSessionCredentials();
  });
}
