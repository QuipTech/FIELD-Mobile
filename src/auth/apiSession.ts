import { fetchAuthSession } from 'aws-amplify/auth';
import * as SecureStore from 'expo-secure-store';

import { http, NetworkError, setTokenProvider } from '@/lib/http';

/**
 * The FIELD API's own session. After Cognito sign-in the app swaps the Cognito ID token for
 * API tokens via `POST /auth/sync`, then sends the API access token on every request.
 */

export type ApiUser = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  roles?: string[];
  permissions?: string[];
};
export type ApiTenant = { id: string; name: string; slug?: string };

/** Sent on a first sign-in, when the API answers `profileRequired`. */
export type CompanyProfile = { companyName: string; phoneNumber: string };

type SessionPayload = {
  accessToken: string;
  refreshToken: string;
  /** Seconds. */
  expiresIn?: number;
  user: ApiUser;
  tenant: ApiTenant;
};
type SyncResponse = { status: 'signedIn'; session: SessionPayload } | { status: 'profileRequired' };
type RefreshResponse = { accessToken?: string; refreshToken?: string; expiresIn?: number };

type StoredSession = Omit<SessionPayload, 'expiresIn'> & { expiresAt: number };

const STORE_KEY = 'fieldApiSession';
/** Refresh this long before expiry, so a request never leaves with a token about to lapse. */
const EXPIRY_MARGIN_MS = 30_000;
/** Used when the API omits `expiresIn`; a 401 still triggers a refresh if it was wrong. */
const DEFAULT_TTL_S = 15 * 60;

let cache: StoredSession | null | undefined; // undefined = not read from storage yet

async function load(): Promise<StoredSession | null> {
  if (cache !== undefined) return cache;
  try {
    const raw = await SecureStore.getItemAsync(STORE_KEY);
    cache = raw ? (JSON.parse(raw) as StoredSession) : null;
  } catch {
    cache = null;
  }
  return cache;
}

async function save(next: StoredSession | null) {
  cache = next;
  if (next) await SecureStore.setItemAsync(STORE_KEY, JSON.stringify(next));
  else await SecureStore.deleteItemAsync(STORE_KEY);
}

const expiresAt = (expiresIn?: number) => Date.now() + (expiresIn ?? DEFAULT_TTL_S) * 1000;

export const hasApiSession = async () => (await load()) !== null;
export const getApiSession = load;

/** Stores a re-fetched user (roles and permissions change mid-session). */
export async function updateApiUser(user: ApiUser) {
  const current = await load();
  if (current) await save({ ...current, user });
}

const refreshListeners = new Set<() => void>();

/** Runs after every successful access-token refresh. Returns unsubscribe. */
export function onAccessTokenRefreshed(listener: () => void) {
  refreshListeners.add(listener);
  return () => {
    refreshListeners.delete(listener);
  };
}

/**
 * Exchanges the current Cognito ID token for an API session. Returns `profileRequired` on a
 * first sign-in with no company yet; call again with `profile` to create the company and user.
 */
export async function syncApiSession(
  profile?: CompanyProfile,
): Promise<'signedIn' | 'profileRequired'> {
  const { tokens } = await fetchAuthSession();
  const idToken = tokens?.idToken?.toString();
  if (!idToken) throw Object.assign(new Error('Not signed in'), { name: 'NotSignedIn' });

  const res = await http.post<SyncResponse>('/auth/sync', profile ?? {}, {
    auth: false,
    headers: { Authorization: `Bearer ${idToken}` },
  });
  if (res.status !== 'signedIn') return 'profileRequired';
  const { expiresIn, ...session } = res.session;
  await save({ ...session, expiresAt: expiresAt(expiresIn) });
  return 'signedIn';
}

/** New access token via the API refresh token; falls back to a fresh Cognito sync. */
async function refreshAccessToken(): Promise<string | null> {
  const current = await load();
  if (!current) return null;
  try {
    const res = await http.post<RefreshResponse | { data: RefreshResponse }>(
      '/auth/refresh',
      { refreshToken: current.refreshToken },
      { auth: false },
    );
    const body = 'data' in res ? res.data : res;
    if (!body.accessToken) throw new Error('No access token in refresh response');
    await save({
      ...current,
      accessToken: body.accessToken,
      refreshToken: body.refreshToken ?? current.refreshToken,
      expiresAt: expiresAt(body.expiresIn),
    });
    refreshListeners.forEach((listener) => listener());
    return body.accessToken;
  } catch (error) {
    if (error instanceof NetworkError) throw error;
    // API refresh token rejected: Amplify keeps Cognito fresh, so sync again from it.
    try {
      return (await syncApiSession()) === 'signedIn' ? ((await load())?.accessToken ?? null) : null;
    } catch {
      return null;
    }
  }
}

/** Ends the API session (best effort: offline sign-out still clears it locally). */
export async function endApiSession() {
  const current = await load();
  await save(null);
  if (current) {
    await http
      .post('/auth/logout', { refreshToken: current.refreshToken }, { auth: false, retry: false })
      .catch(() => undefined);
  }
}

/** Connects the HTTP client to this session. `onExpired` runs when the session can't be renewed. */
export function registerApiTokenProvider(onExpired: () => void) {
  setTokenProvider({
    getToken: async () => {
      const current = await load();
      if (!current) return null;
      if (current.expiresAt - EXPIRY_MARGIN_MS > Date.now()) return current.accessToken;
      try {
        return (await refreshAccessToken()) ?? current.accessToken;
      } catch {
        return current.accessToken; // offline: the request fails on its own, no sign-out
      }
    },
    refreshToken: () => refreshAccessToken().catch(() => null),
    onSessionExpired: onExpired,
  });
}
