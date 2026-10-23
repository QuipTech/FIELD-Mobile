import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { create } from 'zustand';

import { hasApiSession, syncApiSession } from './apiSession';

/**
 * `unknown` until the stored session has been checked on launch. `profileRequired`: signed in
 * to Cognito, but the API needs company and phone before it creates the user (first sign-in).
 */
export type SessionStatus = 'unknown' | 'signedOut' | 'profileRequired' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  setStatus: (status: SessionStatus) => void;
};

/** Auth session gate for routing (see Stack.Protected in app/_layout.tsx). */
export const useSession = create<SessionState>((set) => ({
  status: 'unknown',
  setStatus: (status) => set({ status }),
}));

/**
 * Restores the session on launch. Amplify keeps Cognito tokens; the API session is in secure
 * storage. A stored API session opens the app straight away (works offline); otherwise the
 * app syncs with the API now.
 */
export async function hydrateSession() {
  const { setStatus } = useSession.getState();
  try {
    await getCurrentUser();
  } catch {
    setStatus('signedOut');
    return;
  }
  if (await hasApiSession()) {
    setStatus('signedIn');
    return;
  }
  try {
    setStatus(await syncApiSession());
  } catch {
    // Can't reach the API and nothing stored: sign in again (a kept Cognito session is reused).
    setStatus('signedOut');
  }
}

/**
 * Keeps the gate in sync with Amplify when Cognito ends the session. Sign-in is not handled
 * here: the auth flows set the status only after the API session exists.
 */
export function listenForAuthEvents() {
  return Hub.listen('auth', ({ payload }) => {
    if (payload.event === 'signedOut' || payload.event === 'tokenRefresh_failure') {
      useSession.getState().setStatus('signedOut');
    }
  });
}
