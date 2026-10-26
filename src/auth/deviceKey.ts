import 'react-native-get-random-values';
import { ed25519 } from '@noble/curves/ed25519.js';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { z } from 'zod';

import { ApiError, http } from '@/lib/http';
import { storeApiSession, type SessionPayload } from './apiSession';

/**
 * Device keys for Face ID / fingerprint sign-in (Biometric Sign-in API). The phone makes an
 * Ed25519 key pair: the API keeps the public key against the user, and the secret key stays on
 * the phone behind biometrics (biometrics.ts stores it). Signing in signs a one-time challenge
 * from the API, which answers with a normal FIELD session. No password is kept, so it works for
 * Google / Apple accounts too, and the API can see and revoke every device.
 */

export type DeviceKey = { keyId: string; secretKey: string };

const toBase64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

/** The exact bytes signed: the challenge, bound to this purpose so it can't be reused elsewhere. */
export const challengeMessage = (challengeId: string, challenge: string) =>
  new TextEncoder().encode(`field-biometric-v1:${challengeId}:${challenge}`);

const registered = z.object({ id: z.string() }).loose();
const issued = z.object({ challengeId: z.string(), challenge: z.string() }).loose();

/**
 * Makes a key pair and registers its public key for the signed-in user. Null while the API
 * doesn't offer device keys yet (404), so the caller can fall back to the saved password.
 */
export async function createDeviceKey(): Promise<DeviceKey | null> {
  const { secretKey, publicKey } = ed25519.keygen();
  try {
    const res = registered.parse(
      await http.post('/me/biometric-keys', {
        algorithm: 'ed25519',
        publicKey: toBase64(publicKey),
        deviceType: Platform.OS,
        appVersion: Constants.expoConfig?.version,
      }),
    );
    return { keyId: res.id, secretKey: toBase64(secretKey) };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/** Revokes a key on the API (best effort: the local copy is deleted regardless). */
export const deleteDeviceKey = (keyId: string) =>
  http
    .delete(`/me/biometric-keys/${encodeURIComponent(keyId)}`, { retry: false })
    .catch(() => undefined);

/** The API no longer knows this key (revoked, or the user was removed). */
export const isKeyRevoked = (error: unknown) =>
  error instanceof ApiError && (error.status === 404 || error.status === 410);

/** Signs the API's challenge and stores the session it returns. */
export async function signInWithDeviceKey({ keyId, secretKey }: DeviceKey) {
  const { challengeId, challenge } = issued.parse(
    await http.post('/auth/biometric/challenge', { keyId }, { auth: false }),
  );
  const signature = ed25519.sign(challengeMessage(challengeId, challenge), fromBase64(secretKey));
  const res = await http.post<{ session: SessionPayload }>(
    '/auth/biometric/verify',
    { keyId, challengeId, signature: toBase64(signature) },
    { auth: false },
  );
  await storeApiSession(res.session);
}
