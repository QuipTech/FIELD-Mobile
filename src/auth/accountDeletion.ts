import { signOut } from 'aws-amplify/auth';
import { z } from 'zod';

import { registerForPush, unregisterPushDevice } from '@/features/notifications/push';
import { http } from '@/lib/http';
import { queryClient } from '@/lib/queryClient';
import { useOutbox } from '@/offline/outbox';
import { endApiSession } from './apiSession';
import { forgetBiometricSignIn } from './biometrics';
import { useSession } from './session';

/**
 * Delete account (`DELETE /users/me`): permanently removes the user's profile, sign-in and AI
 * conversations. Asset and configuration records belong to the company's CMDB and stay, no
 * longer attributed to them. The organisation's last Owner can't delete themselves.
 */

export const deletionEligibility = z.object({
  canDelete: z.boolean(),
  /** Why not, in words to show instead of the button (e.g. the last Owner). */
  blockedReason: z.string().nullish(),
});
export type DeletionEligibility = z.infer<typeof deletionEligibility>;

export const deletionEligibilityKey = ['account', 'deletion-eligibility'] as const;

export async function fetchDeletionEligibility(): Promise<DeletionEligibility> {
  return deletionEligibility.parse(await http.get('/users/me/deletion-eligibility'));
}

/**
 * Deletes the signed-in user's account, then signs out on this phone. The cleanup that needs the
 * API (push registration, the biometric device key) runs first, while the session still works;
 * afterwards nothing is sent, as the account and its sessions no longer exist.
 */
export async function deleteAccount(email: string): Promise<void> {
  await unregisterPushDevice();
  await forgetBiometricSignIn(email);
  try {
    // Not retried: the API removes the Cognito sign-in first, and a retry is the user's call.
    await http.delete('/users/me', { retry: false });
  } catch (error) {
    // Still signed in: keep this phone getting alerts.
    void registerForPush();
    throw error;
  }
  await endLocalSession();
}

/** Sign out on this phone only (signOutUser, minus the calls a deleted account can't answer). */
async function endLocalSession() {
  await endApiSession(); // its /auth/logout is unauthenticated and its failure ignored
  await signOut().catch(() => undefined);
  queryClient.clear();
  useOutbox.getState().clear();
  useSession.getState().setStatus('signedOut');
}
