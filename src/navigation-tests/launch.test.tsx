import { renderRouter, screen } from 'expo-router/testing-library';

import { useSession } from '@/auth/session';

// Real app routes and layout; only the outside world is stubbed.
jest.mock('@/auth/amplify', () => ({ configureAmplify: jest.fn() }));
jest.mock('@/lib/env', () => ({
  env: { appEnv: 'development', apiBaseUrl: 'https://api.test', wsUrl: '', sentryDsn: '' },
}));
jest.mock('@/theme/fonts', () => ({ useAppFonts: () => ({ loaded: true, error: null }) }));
jest.mock('aws-amplify/utils', () => ({ Hub: { listen: () => () => undefined } }));
const mockGetCurrentUser = jest.fn();
jest.mock('aws-amplify/auth', () => ({
  getCurrentUser: () => mockGetCurrentUser(),
  fetchUserAttributes: async () => ({ email: 'jo@quiptech.com', given_name: 'Jo' }),
}));

// Renders the whole app, so the first run includes a cold transform of every route.
jest.setTimeout(30_000);

beforeEach(() => useSession.setState({ status: 'unknown' }));

describe('app launch', () => {
  it('shows onboarding when there is no stored session', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Every machine, one scan away')).toBeTruthy();
  });

  it('opens Home when a session is restored', async () => {
    mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' });
    await renderRouter('src/app', { initialUrl: '/' });
    expect(await screen.findByText('Search machines or manuals')).toBeTruthy();
    expect(await screen.findByText(/, Jo$/)).toBeTruthy(); // "Good morning, Jo" etc.
  });

  it('sends a cold Google/Apple return link to sign in, not a blank screen', async () => {
    mockGetCurrentUser.mockRejectedValue(new Error('UserUnAuthenticatedException'));
    await renderRouter('src/app', { initialUrl: '/auth/callback' });
    expect(await screen.findByText('Machine history, manuals and AI in the pit')).toBeTruthy();
  });
});
