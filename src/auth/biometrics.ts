import * as SecureStore from 'expo-secure-store';
import { AppState } from 'react-native';
import { create } from 'zustand';

import { detectSupport, type BiometricSupport } from './biometricSupport';
import { createDeviceKey, deleteDeviceKey, isKeyRevoked, signInWithDeviceKey } from './deviceKey';
import { isAuthError } from './errors';
import { signInWithEmail, type SignInOutcome } from './flows';
import {
  forgetSessionCredentialsOnSignOut,
  rememberSessionCredentials,
} from './sessionCredentials';
import { useSession } from './session';

/**
 * Face ID / Touch ID / fingerprint sign-in. A device key (deviceKey.ts) lives in the Keychain
 * (iOS) or Keystore (Android) behind the device's biometrics: reading it needs a face or finger,
 * and enrolling a new one invalidates it. Until the API offers device keys, the email and
 * password are kept there instead and replayed through Cognito. Either way it works after
 * sign-out and after the session has expired.
 */

export type { BiometricKind, BiometricSupport } from './biometricSupport';

/** What sits behind biometrics: a device key, or (until the API has device keys) the password. */
type Saved = { email: string } & ({ keyId: string; secretKey: string } | { password: string });

const SECRET_KEY = 'fieldBiometricCredentials';
/** Not protected: tells the app biometric sign-in is on, and for whom, without a prompt. */
const EMAIL_KEY = 'fieldBiometricEmail';
/** Not protected: the device key's id, so turning it off can revoke it without a prompt. */
const KEY_ID_KEY = 'fieldBiometricKeyId';
/** Protected items need their own keychain service, apart from non-authenticated ones. */
const SERVICE = 'fieldBiometric';
const SECRET_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: SERVICE,
  requireAuthentication: true,
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

type BiometricState = {
  /** Null when the device has no enrolled biometrics (or they can't protect a secret). */
  support: BiometricSupport | null;
  /** Account biometric sign-in is set up for; null when it's off. */
  email: string | null;
};

export const useBiometrics = create<BiometricState>(() => ({ support: null, email: null }));

/** Reads device support and the saved account. Safe to call again at any time. */
export async function hydrateBiometrics() {
  try {
    const [support, email] = await Promise.all([
      detectSupport(),
      SecureStore.getItemAsync(EMAIL_KEY),
    ]);
    useBiometrics.setState({ support, email });
  } catch {
    useBiometrics.setState({ support: null });
  }
}

/**
 * Hydrates now and again on return to the app (Face ID may have been set up meanwhile), and
 * drops the session's remembered password on sign-out.
 */
export function startBiometricSync() {
  hydrateBiometrics();
  const sub = AppState.addEventListener('change', (state) => {
    if (state === 'active') hydrateBiometrics();
  });
  const stopForgetting = forgetSessionCredentialsOnSignOut();
  return () => {
    sub.remove();
    stopForgetting();
  };
}

const biometricError = (message: string) =>
  Object.assign(new Error(message), { name: 'BiometricError' });
const isCancel = (error: unknown) => error instanceof Error && /cancel/i.test(error.message);

/** On, cancelled at the prompt, or the API has no device keys yet and no password is to hand. */
export type EnableOutcome = 'on' | 'cancelled' | 'needsPassword';

/**
 * Turns biometric sign-in on for the signed-in user: registers a device key with the API, or,
 * until the API offers device keys, saves `password` instead. Android asks for a fingerprint
 * while saving; iOS only asks when signing in.
 */
export async function enableBiometricSignIn(
  email: string,
  password?: string,
): Promise<EnableOutcome> {
  const { support } = useBiometrics.getState();
  if (!support) return 'cancelled';
  const key = await createDeviceKey();
  if (!key && !password) return 'needsPassword';
  const secret: Saved = key ? { email, ...key } : { email, password: password! };
  await disableBiometricSignIn(); // replaces any earlier key; iOS also prompts on updates
  try {
    await SecureStore.setItemAsync(SECRET_KEY, JSON.stringify(secret), {
      ...SECRET_OPTIONS,
      authenticationPrompt: `Turn on ${support.label} for FIELD`,
    });
  } catch (error) {
    if (key) await deleteDeviceKey(key.keyId);
    if (isCancel(error)) return 'cancelled';
    throw error;
  }
  await SecureStore.setItemAsync(EMAIL_KEY, email);
  if (key) await SecureStore.setItemAsync(KEY_ID_KEY, key.keyId);
  useBiometrics.setState({ email });
  return 'on';
}

/** Turns it off on this phone, and revokes the device key on the API when there is one. */
export async function disableBiometricSignIn() {
  const keyId = await SecureStore.getItemAsync(KEY_ID_KEY).catch(() => null);
  await Promise.all([
    SecureStore.deleteItemAsync(SECRET_KEY, { keychainService: SERVICE }),
    SecureStore.deleteItemAsync(EMAIL_KEY),
    SecureStore.deleteItemAsync(KEY_ID_KEY),
  ]).catch(() => undefined);
  useBiometrics.setState({ email: null });
  if (keyId) await deleteDeviceKey(keyId);
}

/** Turns biometric sign-in off if it belongs to `email` (e.g. that account's password changed). */
export async function forgetBiometricSignIn(email: string) {
  const saved = useBiometrics.getState().email;
  if (saved && saved.toLowerCase() === email.toLowerCase()) await disableBiometricSignIn();
}

/**
 * Unlocks the saved device key (or password) with a biometric prompt and signs in with it.
 * Returns 'cancelled' when the person dismissed the prompt. When it no longer works (biometrics
 * re-enrolled, key revoked, password changed) it turns itself off and throws a BiometricError
 * telling them to sign in another way.
 */
export async function signInWithBiometrics(): Promise<SignInOutcome | 'cancelled'> {
  const label = useBiometrics.getState().support?.label ?? 'biometric sign-in';
  const turnBackOn = `Sign in another way, then turn ${label} back on in Me → Security.`;
  let raw: string | null;
  try {
    raw = await SecureStore.getItemAsync(SECRET_KEY, {
      ...SECRET_OPTIONS,
      authenticationPrompt: 'Sign in to FIELD',
    });
  } catch (error) {
    if (isCancel(error)) return 'cancelled';
    throw error;
  }
  if (!raw) {
    // Null means the key was invalidated by a newly enrolled face or fingerprint.
    await disableBiometricSignIn();
    throw biometricError(`Your ${label} settings changed. ${turnBackOn}`);
  }

  const saved = JSON.parse(raw) as Saved;
  if ('keyId' in saved) {
    try {
      await signInWithDeviceKey(saved);
    } catch (error) {
      if (!isKeyRevoked(error)) throw error;
      await disableBiometricSignIn();
      throw biometricError(`${label} sign-in was turned off for this phone. ${turnBackOn}`);
    }
    useSession.getState().setStatus('signedIn');
    return 'done';
  }
  const { email, password } = saved;
  try {
    const outcome = await signInWithEmail(email, password);
    // Lets Me → Security turn it straight back on if it's switched off this session.
    if (outcome === 'done') await rememberSessionCredentials(email, password);
    return outcome;
  } catch (error) {
    const throttled = error instanceof Error && /attempts exceeded/i.test(error.message);
    const rejected =
      (isAuthError(error, 'NotAuthorizedException') && !throttled) ||
      isAuthError(error, 'UserNotFoundException');
    if (!rejected) throw error;
    await disableBiometricSignIn();
    throw biometricError(`Your saved password no longer works. ${turnBackOn}`);
  }
}
