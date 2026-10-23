import { NetworkError } from '@/lib/http';
import { clearAccess, hydrateAccess, refreshAccess, useAccess } from '../access';

const mockGet = jest.fn();
jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http'),
  http: { get: (...args: unknown[]) => mockGet(...args) },
}));

const stored = {
  accessToken: 'a',
  refreshToken: 'r',
  expiresAt: 0,
  tenant: { id: 't1', name: 'Mintek' },
  user: { id: 'u1', email: 'u@mintek.com.au', roles: ['technician'], permissions: ['cases.read'] },
};
const mockUpdateApiUser = jest.fn();
jest.mock('../apiSession', () => ({
  getApiSession: async () => stored,
  updateApiUser: (user: unknown) => mockUpdateApiUser(user),
  onAccessTokenRefreshed: () => () => undefined,
}));
jest.mock('../session', () => ({
  useSession: { getState: () => ({ status: 'signedIn' }), subscribe: () => () => undefined },
}));

beforeEach(() => {
  clearAccess();
  mockGet.mockReset();
  mockUpdateApiUser.mockReset();
});

describe('access', () => {
  it('starts from the stored /auth/sync session, so it works offline', async () => {
    await hydrateAccess();
    expect(useAccess.getState()).toMatchObject({
      roles: ['technician'],
      permissions: ['cases.read'],
      capabilities: { canUseAi: false, isOrganisationAdmin: false },
      loaded: true,
    });
  });

  it.each([
    ['the user at the top level', { roles: ['admin'], permissions: ['machines.edit'] }],
    ['a `user` wrapper', { user: { roles: ['admin'], permissions: ['machines.edit'] } }],
    ['a `data` wrapper', { data: { roles: ['admin'], permissions: ['machines.edit'] } }],
    ['object codes', { roles: [{ code: 'admin' }], permissions: [{ key: 'machines.edit' }] }],
  ])('re-fetches GET /auth/me with %s and stores it', async (_, body) => {
    mockGet.mockResolvedValue(body);
    await refreshAccess();
    expect(mockGet).toHaveBeenCalledWith('/auth/me', { retry: false });
    expect(useAccess.getState()).toMatchObject({
      roles: ['admin'],
      permissions: ['machines.edit'],
    });
    expect(mockUpdateApiUser).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'u1', roles: ['admin'], permissions: ['machines.edit'] }),
    );
  });

  it('reads capabilities and the profile from the documented /auth/me shape', async () => {
    mockGet.mockResolvedValue({
      id: 'u1',
      email: 'tess@example.com',
      firstName: 'Tess',
      lastName: 'Tech',
      site: 'Pit 4',
      language: 'en-AU',
      roles: ['Field Technician'],
      permissions: ['ai.use', 'machine.view'],
      capabilities: { canUseAi: true, isSupportStaff: false },
      tenant: { id: 't1', name: 'Acme Mining', slug: 'acme-mining' },
    });
    await refreshAccess();
    const state = useAccess.getState();
    expect(state.capabilities).toMatchObject({ canUseAi: true, canManageMachines: false });
    expect(state.profile).toMatchObject({ firstName: 'Tess', site: 'Pit 4' });
    expect(state.profile?.tenant?.name).toBe('Acme Mining');
  });

  it('derives capabilities from permissions when the payload has none', async () => {
    mockGet.mockResolvedValue({ roles: ['Owner'], permissions: ['platform.manage'] });
    await refreshAccess();
    expect(useAccess.getState().capabilities.isPlatformAdmin).toBe(true);
  });

  it('keeps the current access when the refresh fails (offline)', async () => {
    await hydrateAccess();
    mockGet.mockRejectedValue(new NetworkError('offline'));
    await refreshAccess();
    expect(useAccess.getState().roles).toEqual(['technician']);
  });

  it('shares one request between overlapping refreshes', async () => {
    mockGet.mockResolvedValue({ roles: [], permissions: [] });
    await Promise.all([refreshAccess(), refreshAccess()]);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
