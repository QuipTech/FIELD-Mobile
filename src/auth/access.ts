import { AppState } from 'react-native';
import { create } from 'zustand';

import { ApiError, http } from '@/lib/http';
import { queryClient } from '@/lib/queryClient';
import { getApiSession, onAccessTokenRefreshed, updateApiUser, type ApiUser } from './apiSession';
import { capabilitiesFrom, toMe, type Capabilities, type Me, type MeProfile } from './me';
import { useSession } from './session';

/**
 * Roles and permissions of the signed-in user, from the API (the source of truth). Seeded
 * from the stored `/auth/sync` session, then re-fetched from `GET /auth/me` on sign-in, after
 * every token refresh, when the app returns to the foreground, and after any 403.
 */

type AccessState = {
  roles: string[];
  permissions: string[];
  capabilities: Capabilities;
  /** From the last `GET /auth/me`; null until it has been fetched. */
  profile: MeProfile | null;
  loaded: boolean;
};

const EMPTY = { roles: [], permissions: [], capabilities: capabilitiesFrom([]), profile: null };

export const useAccess = create<AccessState>(() => ({ ...EMPTY, loaded: false }));

function setAccess(user: Pick<ApiUser, 'roles' | 'permissions'>, me?: Me) {
  const permissions = user.permissions ?? [];
  useAccess.setState((s) => ({
    roles: user.roles ?? [],
    permissions,
    capabilities: me?.capabilities ?? capabilitiesFrom(permissions),
    profile: me?.profile ?? s.profile,
    loaded: true,
  }));
}

/** Cached access from the stored session: available offline, before any request. */
export async function hydrateAccess() {
  const session = await getApiSession();
  if (session) setAccess(session.user);
}

let inFlight: Promise<void> | null = null;

/** Re-fetches roles and permissions. Failures keep the current access (the API still enforces). */
export function refreshAccess(): Promise<void> {
  inFlight ??= (async () => {
    try {
      const me = toMe(await http.get('/auth/me', { retry: false }));
      setAccess(me, me);
      const session = await getApiSession();
      if (session)
        await updateApiUser({
          ...session.user,
          roles: me.roles,
          permissions: me.permissions,
        });
    } catch {
      // Offline or unexpected shape: keep what we have.
    } finally {
      inFlight = null;
    }
  })();
  return inFlight;
}

export function clearAccess() {
  useAccess.setState({ ...EMPTY, loaded: false });
}

const FORBIDDEN_REFRESH_GAP_MS = 30_000;

/** Wires the refresh triggers. Call once from the root layout; returns cleanup. */
export function startAccessSync() {
  let lastForbiddenRefresh = 0;
  const whenSignedIn = (run: () => void) => useSession.getState().status === 'signedIn' && run();

  const unsubSession = useSession.subscribe((s, prev) => {
    if (s.status === prev.status) return;
    if (s.status === 'signedIn') hydrateAccess().then(refreshAccess);
    else clearAccess();
  });
  const unsubRefresh = onAccessTokenRefreshed(() => whenSignedIn(refreshAccess));
  const appState = AppState.addEventListener('change', (state) => {
    if (state === 'active') whenSignedIn(refreshAccess);
  });
  // A 403 may mean a role changed since the last fetch.
  const unsubQueries = queryClient.getQueryCache().subscribe((event) => {
    const error =
      event.type === 'updated' && event.action.type === 'error' ? event.action.error : null;
    if (!(error instanceof ApiError && error.isForbidden)) return;
    if (Date.now() - lastForbiddenRefresh < FORBIDDEN_REFRESH_GAP_MS) return;
    lastForbiddenRefresh = Date.now();
    whenSignedIn(refreshAccess);
  });

  whenSignedIn(() => hydrateAccess().then(refreshAccess));
  return () => {
    unsubSession();
    unsubRefresh();
    appState.remove();
    unsubQueries();
  };
}
