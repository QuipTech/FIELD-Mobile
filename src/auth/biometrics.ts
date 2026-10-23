import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { AppState, Platform } from 'react-native';
import { create } from 'zustand';

import { isAuthError } from './errors';
import { signInWithEmail, type SignInOutcome } from './flows';
import {
  forgetSessionCredentialsOnSignOut,
  rememberSessionCredentials,
} from './sessionCredentials';

/**
 * Face ID / Touch ID / fingerprint sign-in. The email and password live in the Keychain (iOS)
 * or Keystore (Android) behind the device's biometrics: reading them needs a face or finger,
 * and enrolling a new one invalidates them. Unlocking them signs in through the normal Cognito
 * flow, so it works after sign-out and after the session has expired.
 */

export type BiometricKind = 'face' | 'fingerprint';
/** What this device offers, e.g. `{ kind: 'face', label: 'Face ID' }`. */
export type BiometricSupport = { kind: BiometricKind; label: string };

type Credentials = { email: string; password: string };

const SECRET_KEY = 'fieldBiometricCredentials';
/** Not protected: tells the app biometric sign-in is on, and for whom, without a prompt. */
const EMAIL_KEY = 'fieldBiometricEmail';
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

const { FACIAL_RECOGNITION, FINGERPRINT } = LocalAuthentication.AuthenticationType;

async function detectSupport(): Promise<BiometricSupport | null> {
  const [hardware, enrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  if (!hardware || !enrolled || !SecureStore.canUseBiometricAuthentication()) return null;
  if (Platform.OS === 'ios') {
    return types.includes(FACIAL_RECOGNITION)
      ? { kind: 'face', label: 'Face ID' }
      : { kind: 'fingerprint', label: 'Touch ID' };
  }
  // Android: the system prompt picks the method, so name it only when there's just one.
  if (types.length === 1 && types[0] === FACIAL_RECOGNITION) {
    return { kind: 'face', label: 'face unlock' };
  }
  return types.includes(FINGERPRINT) && types.length === 1
    ? { kind: 'fingerprint', label: 'fingerprint' }
    : { kind: 'fingerprint', label: 'biometrics' };
}

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

/**
 * Saves the credentials behind biometrics. Returns false if the person cancelled the prompt
 * (Android asks for a fingerprint while saving; iOS only asks when signing in).
 */
export async function enableBiometricSignIn(email: string, password: string): Promise<boolean> {
  const { support } = useBiometrics.getState();
  if (!support) return false;
  // No extra biometric check here: they've just entered the password, and the saved item can
  // only be read with their face or finger anyway. (Android's save still prompts by itself.)
  // Delete first: iOS prompts when updating an existing item.
  await SecureStore.deleteItemAsync(SECRET_KEY, { keychainService: SERVICE }).catch(
    () => undefined,
  );
  try {
    const credentials: Credentials = { email, password };
    await SecureStore.setItemAsync(SECRET_KEY, JSON.stringify(credentials), {
      ...SECRET_OPTIONS,
      authenticationPrompt: `Turn on ${support.label} for FIELD`,
    });
  } catch (error) {
    if (isCancel(error)) return false;
    throw error;
  }
  await SecureStore.setItemAsync(EMAIL_KEY, email);
  useBiometrics.setState({ email });
  return true;
}

export async function disableBiometricSignIn() {
  await Promise.all([
    SecureStore.deleteItemAsync(SECRET_KEY, { keychainService: SERVICE }),
    SecureStore.deleteItemAsync(EMAIL_KEY),
  ]).catch(() => undefined);
  useBiometrics.setState({ email: null });
}

/** Turns biometric sign-in off if it belongs to `email` (e.g. that account's password changed). */
export async function forgetBiometricSignIn(email: string) {
  const saved = useBiometrics.getState().email;
  if (saved && saved.toLowerCase() === email.toLowerCase()) await disableBiometricSignIn();
}

/**
 * Unlocks the saved credentials with a biometric prompt and signs in with them. Returns
 * 'cancelled' when the person dismissed the prompt. When the saved credentials no longer work
 * (biometrics re-enrolled, password changed) it turns itself off and throws a BiometricError
 * telling them to use their password.
 */
export async function signInWithBiometrics(): Promise<SignInOutcome | 'cancelled'> {
  const label = useBiometrics.getState().support?.label ?? 'biometric sign-in';
  const turnBackOn = `Sign in with your password to turn ${label} back on.`;
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

  const { email, password } = JSON.parse(raw) as Credentials;
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
