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

describe('signed-in screens', () => {
  beforeEach(() => mockGetCurrentUser.mockResolvedValue({ userId: 'u1', username: 'u1' }));

  it.each([
    ['/me', 'Offline downloads'],
    ['/cases', "Brake pressure alarm won't clear"],
    ['/billing', '3,140 / 4,000 queries'],
    ['/upgrade', 'Continue to Stripe checkout'],
    ['/help', 'How do I work offline in the pit?'],
    ['/help/pending-sync', 'Why is my entry stuck "pending sync"?'],
    ['/machine-history', 'Main hydraulic pump replaced'],
    ['/ai-history', 'Show me the drill rod change procedure'],
    ['/case/1042', 'Raised from AI assistant conversation.'],
    ['/notifications', 'Manual update available'],
    ['/notifications/n-2204', 'Open case #1042'],
    ['/machines', 'CAT 793F · Bench 3 · 14,208 h'],
    ['/machine/HT-2201', 'S/N 4GZ01288'],
    ['/machine/HT-2201/history', 'E-2204 · accumulator pre-charge low'],
    ['/machine/HT-2201/configuration', 'Hydraulic pump: 4T-9410 → 4T-9455'],
    ['/machine/HT-2201/manuals', 'Rear suspension cylinder recharge'],
    ['/machine/XX-0000', 'Machine not found'],
    ['/ask-ai', 'Log as entry'],
    ['/scan', 'Scan asset tag'],
    ['/capture', 'Step 1 of 3 · Details'],
    ['/document/rear-suspension-recharge', 'Prerequisites'],
  ])('opens %s', async (url, text) => {
    await renderRouter('src/app', { initialUrl: url });
    expect(await screen.findByText(text)).toBeTruthy();
  });
});
