import {
  autoSignIn,
  confirmResetPassword,
  confirmSignIn,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  signIn,
  signInWithRedirect,
  signOut,
  signUp,
} from 'aws-amplify/auth';

import { unregisterPushDevice } from '@/features/notifications/push';
import { queryClient } from '@/lib/queryClient';
import { useOutbox } from '@/offline/outbox';
import { endApiSession, syncApiSession, type CompanyProfile } from './apiSession';
import { isAuthError } from './errors';
import { useSession } from './session';

/**
 * Opens the API session for the Cognito user who just signed in, and moves the gate on:
 * into the app, or to "Finish setting up" when the API still needs company and phone.
 */
export async function establishSession(profile?: CompanyProfile) {
  const status = await syncApiSession(profile);
  useSession.getState().setStatus(status);
}

const markSignedIn = establishSession;

/** What the UI should do after a sign-in attempt. */
export type SignInOutcome =
  | 'done'
  | 'confirmSignUp' // account exists but email was never verified — a new code was sent
  | 'resetPassword' // Cognito requires a password reset
  | 'newPasswordRequired' // admin-created user signing in with a temporary password
  | 'unsupported'; // MFA etc. — the pool has MFA off, so not handled yet

export async function signInWithEmail(email: string, password: string): Promise<SignInOutcome> {
  try {
    const { nextStep } = await signIn({ username: email, password });
    switch (nextStep.signInStep) {
      case 'DONE':
        await markSignedIn();
        return 'done';
      case 'CONFIRM_SIGN_UP':
        await resendSignUpCode({ username: email });
        return 'confirmSignUp';
      case 'RESET_PASSWORD':
        return 'resetPassword';
      case 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED':
        return 'newPasswordRequired';
      default:
        return 'unsupported';
    }
  } catch (error) {
    // A session survived (e.g. hydrate raced the form) — treat as signed in.
    if (isAuthError(error, 'UserAlreadyAuthenticatedException')) {
      await markSignedIn();
      return 'done';
    }
    throw error;
  }
}

export type SocialProvider = 'Google' | 'Apple';

/**
 * Google / Apple sign-in through Cognito's hosted UI in a secure browser sheet. On native the
 * promise covers the whole flow, including the token exchange. Returns false if the user closed
 * the browser.
 */
export async function signInWithProvider(provider: SocialProvider): Promise<boolean> {
  try {
    await signInWithRedirect({ provider });
    await markSignedIn();
    return true;
  } catch (error) {
    if (isAuthError(error, 'OAuthSignInException') && (error as Error).message === 'canceled') {
      return false;
    }
    if (isAuthError(error, 'UserAlreadyAuthenticatedException')) {
      await markSignedIn();
      return true;
    }
    throw error;
  }
}

/** Completes the temporary-password challenge started by signInWithEmail. */
export async function completeNewPassword(newPassword: string) {
  const { nextStep } = await confirmSignIn({ challengeResponse: newPassword });
  if (nextStep.signInStep !== 'DONE') throw new Error(`Unsupported step ${nextStep.signInStep}`);
  await markSignedIn();
}

export type SignUpDetails = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** E.164, e.g. +61400123456 */
  phone: string;
};

export async function registerAccount(details: SignUpDetails) {
  await signUp({
    username: details.email,
    password: details.password,
    options: {
      userAttributes: {
        email: details.email,
        given_name: details.firstName,
        family_name: details.lastName,
        phone_number: details.phone,
      },
      autoSignIn: true,
    },
  });
}

/**
 * Verifies the sign-up email code. Returns true when the user is now signed in (sign-up in this
 * app session); false when they must sign in again (e.g. verifying after a later sign-in attempt).
 */
export async function verifyEmail(
  email: string,
  code: string,
  profile?: CompanyProfile,
): Promise<boolean> {
  const { nextStep } = await confirmSignUp({ username: email, confirmationCode: code });
  if (nextStep.signUpStep !== 'COMPLETE_AUTO_SIGN_IN') return false;
  const result = await autoSignIn();
  if (result.nextStep.signInStep !== 'DONE') return false;
  // The sign-up form already collected company and phone, so the API can create the user now.
  await establishSession(profile);
  return true;
}

export const resendVerificationCode = (email: string) => resendSignUpCode({ username: email });

/**
 * Sends a reset code. An unknown email is treated as success so the screen doesn't reveal
 * which emails have accounts.
 */
export async function requestPasswordReset(email: string) {
  try {
    await resetPassword({ username: email });
  } catch (error) {
    if (!isAuthError(error, 'UserNotFoundException')) throw error;
  }
}

export const completePasswordReset = (email: string, code: string, newPassword: string) =>
  confirmResetPassword({ username: email, confirmationCode: code, newPassword });

export async function signOutUser() {
  await unregisterPushDevice(); // needs the API session, so before /auth/logout
  await endApiSession();
  await signOut();
  queryClient.clear(); // the next user must not see this user's cached data
  useOutbox.getState().clear(); // nor send this user's queued writes with their own token
  useSession.getState().setStatus('signedOut');
}
