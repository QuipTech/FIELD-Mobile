import { ApiError, NetworkError } from '@/lib/http';

const mockPost = jest.fn();
jest.mock('@/lib/env', () => ({ env: { apiBaseUrl: 'https://api.test' } }));
jest.mock('@/lib/http', () => {
  const actual = jest.requireActual('@/lib/http');
  return { ...actual, http: { post: (...args: unknown[]) => mockPost(...args) } };
});
jest.mock('aws-amplify/auth', () => ({
  fetchAuthSession: async () => ({ tokens: { idToken: { toString: () => 'cognito-id-token' } } }),
}));
const mockStore = new Map<string, string>();
jest.mock('expo-secure-store', () => ({
  getItemAsync: async (k: string) => mockStore.get(k) ?? null,
  setItemAsync: async (k: string, v: string) => void mockStore.set(k, v),
  deleteItemAsync: async (k: string) => void mockStore.delete(k),
}));

const session = (accessToken: string, expiresIn = 900) => ({
  status: 'signedIn',
  session: {
    accessToken,
    refreshToken: 'refresh-1',
    expiresIn,
    user: { id: 'u1', email: 'jo@quiptech.com' },
    tenant: { id: 't1', name: 'QuipTech Mining' },
  },
});

// Fresh modules per test so the session cache and the client's token provider start empty.
let api: typeof import('../apiSession');
let getToken: () => Promise<string | null>;
let refreshToken: () => Promise<string | null>;
const onExpired = jest.fn();
beforeEach(() => {
  jest.resetModules();
  jest.clearAllMocks();
  mockStore.clear();
  /* eslint-disable @typescript-eslint/no-require-imports */
  api = require('../apiSession');
  ({ getToken, refreshToken } = require('@/lib/http/auth'));
  /* eslint-enable @typescript-eslint/no-require-imports */
  api.registerApiTokenProvider(onExpired);
});

describe('syncApiSession', () => {
  it('swaps the Cognito ID token for an API session and stores it', async () => {
    mockPost.mockResolvedValueOnce(session('access-1'));
    await expect(api.syncApiSession()).resolves.toBe('signedIn');
    expect(mockPost).toHaveBeenCalledWith(
      '/auth/sync',
      {},
      { auth: false, headers: { Authorization: 'Bearer cognito-id-token' } },
    );
    await expect(api.hasApiSession()).resolves.toBe(true);
  });

  it('reports profileRequired and sends company and phone on the second call', async () => {
    mockPost.mockResolvedValueOnce({ status: 'profileRequired' });
    await expect(api.syncApiSession()).resolves.toBe('profileRequired');
    await expect(api.hasApiSession()).resolves.toBe(false);

    mockPost.mockResolvedValueOnce(session('access-1'));
    const profile = { companyName: 'QuipTech Mining', phoneNumber: '+61412345678' };
    await api.syncApiSession(profile);
    expect(mockPost).toHaveBeenLastCalledWith('/auth/sync', profile, expect.anything());
  });
});

describe('token provider', () => {
  it('hands the HTTP client the stored access token', async () => {
    mockPost.mockResolvedValueOnce(session('access-1'));
    await api.syncApiSession();
    await expect(getToken()).resolves.toBe('access-1');
  });

  it('refreshes an expired token with the API refresh token', async () => {
    mockPost.mockResolvedValueOnce(session('access-1', 0)); // already expired
    await api.syncApiSession();
    mockPost.mockResolvedValueOnce({ accessToken: 'access-2', expiresIn: 900 });
    await expect(getToken()).resolves.toBe('access-2');
    expect(mockPost).toHaveBeenLastCalledWith(
      '/auth/refresh',
      { refreshToken: 'refresh-1' },
      { auth: false },
    );
  });

  it('falls back to a Cognito sync when the API refresh token is rejected', async () => {
    mockPost.mockResolvedValueOnce(session('access-1'));
    await api.syncApiSession();
    mockPost
      .mockRejectedValueOnce(new ApiError(401, 'Session expired or invalid.'))
      .mockResolvedValueOnce(session('access-3'));
    await expect(refreshToken()).resolves.toBe('access-3');
  });

  it('keeps the old token offline instead of signing the user out', async () => {
    mockPost.mockResolvedValueOnce(session('access-1', 0));
    await api.syncApiSession();
    mockPost.mockRejectedValueOnce(new NetworkError('offline'));
    await expect(getToken()).resolves.toBe('access-1');
    expect(onExpired).not.toHaveBeenCalled();
  });
});

describe('endApiSession', () => {
  it('logs out on the API and forgets the session, even when offline', async () => {
    mockPost.mockResolvedValueOnce(session('access-1'));
    await api.syncApiSession();
    mockPost.mockRejectedValueOnce(new NetworkError('offline'));
    await api.endApiSession();
    expect(mockPost).toHaveBeenLastCalledWith(
      '/auth/logout',
      { refreshToken: 'refresh-1' },
      { auth: false, retry: false },
    );
    await expect(api.hasApiSession()).resolves.toBe(false);
  });
});
