import AsyncStorage from '@react-native-async-storage/async-storage';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useSession } from '@/auth/session';
import { installFakeApi } from '@/test/fakeApi';

// Real app routes and layout; only the outside world is stubbed.
jest.mock('@/auth/amplify', () => ({ configureAmplify: jest.fn() }));
jest.mock('@/theme/fonts', () => ({ useAppFonts: () => ({ loaded: true, error: null }) }));
jest.mock('aws-amplify/utils', () => ({ Hub: { listen: () => () => undefined } }));
// API session (POST /auth/sync): stored by default, so signed-in launches open the app.
const mockHasApiSession = jest.fn(async () => true);
const mockSyncApiSession = jest.fn(async () => 'signedIn');
jest.mock('@/auth/apiSession', () => ({
  hasApiSession: () => mockHasApiSession(),
  syncApiSession: () => mockSyncApiSession(),
  registerApiTokenProvider: jest.fn(),
  endApiSession: jest.fn(),
  getApiSession: async () => null,
  updateApiUser: jest.fn(),
  onAccessTokenRefreshed: () => () => undefined,
}));
const mockGetCurrentUser = jest.fn();
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  fetchUserAttributes: async () => ({ email: 'jo@quiptech.com', given_name: 'Jo' }),
}));

// Renders the whole app, so the first run includes a cold transform of every route.
jest.setTimeout(30_000);

beforeAll(() => {
  installFakeApi();
});
beforeEach(() => useSession.setState({ status: 'unknown' }));

describe('app launch', () => {
  it('shows onboarding when there is no stored session', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    mockHasApiSession.mockResolvedValueOnce(false);
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Every machine, one scan away')).toBeTruthy();
  });

  it('skips onboarding once it has been seen on this device', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    mockHasApiSession.mockResolvedValueOnce(false);
    await AsyncStorage.setItem('onboardingSeen', '2026-10-23T00:00:00.000Z');
    try {
      await renderRouter('src/app', { initialUrl: '/' });
      expect(await screen.findByText('Machine history, manuals and AI in the pit')).toBeTruthy();
      expect(screen.queryByText('Every machine, one scan away')).toBeNull();
    } finally {
      await AsyncStorage.removeItem('onboardingSeen');
    }
  });

  it('opens Home when a session is restored', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Search machines or manuals')).toBeTruthy();
    expect(await screen.findByText(/, Jo$/)).toBeTruthy(); // "Good morning, Jo" etc.
  });

  it('opens Home from an API session alone (biometric sign-in has no Cognito session)', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Search machines or manuals')).toBeTruthy();
  });

  it('asks for company and phone when the API needs them (first sign-in)', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' });
    mockHasApiSession.mockResolvedValueOnce(false);
    mockSyncApiSession.mockResolvedValueOnce('profileRequired');
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Finish setting up')).toBeTruthy();
  });

  it('syncs with the API when Cognito is signed in but nothing is stored', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' });
    mockHasApiSession.mockResolvedValueOnce(false);
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Search machines or manuals')).toBeTruthy();
    expect(mockSyncApiSession).toHaveBeenCalled();
  });

  it('sends a cold Google/Apple return link to sign in, not a blank screen', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    mockHasApiSession.mockResolvedValueOnce(false);
    await renderRouter('src/app', { initialUrl: '/auth/callback' });
    expect(await screen.findByText('Machine history, manuals and AI in the pit')).toBeTruthy();
  });
});

describe('signed-in screens', () => {
  beforeEach(() => mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' }));

  it.each([
    ['/me', 'Offline downloads'],
    ['/knowledge', 'Your brands'],
    ['/knowledge/brand/cat', 'Machine maintenance'],
    ['/knowledge/brand/nope', 'You do not have access to this content'],
    ['/knowledge/category/cat-maint', 'D10T Service Manual'],
    ['/knowledge/category/cat-survey', 'No documents yet'],
    ['/knowledge/search', 'Cancel'],
    [
      '/document/d10t-service-manual?page=142&section=4.3',
      'From AI answer · Section 4.3 highlighted',
    ],
    ['/document/missing-doc', 'Document not found'],
    ['/offline-sync', 'Saved documents'],
    ['/machine/HT-2201/compare', 'Serial no.'],
    ['/cases', "Brake pressure alarm won't clear"],
    ['/billing', '142 / 500 queries'],
    ['/new-case', 'Raise case'],
    ['/ai-history', 'Show me the drill rod change procedure'],
    ['/case/1042', 'Checking pump firmware version.'],
    ['/notifications', 'Manual update available'],
    ['/machines', 'CAT 793F · 14,208 h'], // starts on the user's own site
    ['/machine/HT-2201', 'S/N 4GZ01288'],
    ['/machine/HT-2201/history', 'E-2204 · accumulator pre-charge low'],
    ['/machine/HT-2201/configuration', 'Hydraulic pump: 4T-9410 → 4T-9455'],
    ['/machine/HT-2201/manuals', 'Rear suspension cylinder recharge'],
    ['/machine/XX-0000', 'Machine not found'],
    ['/ask-ai', 'Ask about a fault, part or procedure'],
    ['/scan', 'Scan asset tag'],
    ['/capture', 'Step 1 of 3 · Details'],
  ])('opens %s', async (url, text) => {
    await renderRouter('src/app', { initialUrl: url });
    expect(await screen.findByText(text)).toBeTruthy();
  });
});
