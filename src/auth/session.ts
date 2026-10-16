import { getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { create } from 'zustand';

/** `unknown` until the stored Cognito session has been checked on launch. */
export type SessionStatus = 'unknown' | 'signedOut' | 'signedIn';

type SessionState = {
  status: SessionStatus;
  setStatus: (status: SessionStatus) => void;
};

/** Auth session gate for routing (see Stack.Protected in app/_layout.tsx). */
export const useSession = create<SessionState>((set) => ({
  status: 'unknown',
  setStatus: (status) => set({ status }),
}));

/** Restores a persisted session on launch; Amplify keeps tokens in AsyncStorage. */
export async function hydrateSession() {
  try {
    await getCurrentUser();
    useSession.getState().setStatus('signedIn');
  } catch {
    useSession.getState().setStatus('signedOut');
  }
}

/** Keeps the gate in sync with Amplify (sign-out elsewhere, refresh token expired). */
export function listenForAuthEvents() {
  return Hub.listen('auth', ({ payload }) => {
    const { setStatus } = useSession.getState();
    switch (payload.event) {
      case 'signedIn':
        setStatus('signedIn');
        break;
      case 'signedOut':
      case 'tokenRefresh_failure':
        setStatus('signedOut');
        break;
    }
  });
}
