import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BillingScreen } from '../BillingScreen';
import {
  billingApi as mockApi,
  billingCalls as mockCalls,
  resetBillingApi,
} from '@/test/fakeBillingHttp';
import { ORG_SUMMARY, PAID } from '@/test/fixtures/billing';

jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http'),
  http: jest.requireActual('@/test/fakeBillingHttp').fakeHttp,
}));

const mockRole = { canManageBilling: false, capabilities: { canUseAi: false } };
jest.mock('@/auth/useRole', () => ({ useRole: () => mockRole }));
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]), router: {} };
});

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <BottomSheetModalProvider>
          <BillingScreen />
        </BottomSheetModalProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

beforeEach(() => {
  resetBillingApi();
  mockRole.canManageBilling = false;
});

describe('Billing — organisation', () => {
  beforeEach(() => {
    mockApi['GET /me/billing'] = { ...PAID, exempt: true };
    mockApi['GET /organisation/billing'] = ORG_SUMMARY;
    mockApi['GET /organisation/billing/invoices'] = [];
  });

  it('is hidden from users without billing.manage', async () => {
    await setup();
    expect(await screen.findByText('Billing is managed by your company admin.')).toBeTruthy();
    expect(screen.queryByText('Organisation billing')).toBeNull();
    expect(mockCalls.some((c) => c.path.startsWith('/organisation/billing'))).toBe(false);
  });

  it('shows billing admins the plan, this month and the actions', async () => {
    mockRole.canManageBilling = true;
    await setup();
    expect(await screen.findByText('Asset Pro')).toBeTruthy();
    expect(screen.getByText('Monthly, billed in arrears on the 1st. No lock-in.')).toBeTruthy();
    expect(screen.getByText('A$1,234.00')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Switch to annual (2 months free)' })).toBeTruthy();
  });

  it('explains a suspended account', async () => {
    mockRole.canManageBilling = true;
    mockApi['GET /organisation/billing'] = {
      ...ORG_SUMMARY,
      account: { suspendedAt: '2026-10-20T00:00:00Z' },
    };
    await setup();
    expect(await screen.findByText('Account suspended')).toBeTruthy();
  });

  it('undoes a cancellation', async () => {
    mockRole.canManageBilling = true;
    mockApi['GET /organisation/billing'] = {
      ...ORG_SUMMARY,
      plan: { ...ORG_SUMMARY.plan, status: 'cancelling', cancelAt: '2026-11-01' },
    };
    mockApi['DELETE /organisation/billing/cancel'] = ORG_SUMMARY.plan;
    await setup();
    await fireEvent.press(await screen.findByRole('button', { name: 'Keep my plan' }));
    await waitFor(() =>
      expect(mockCalls).toContainEqual({ method: 'DELETE', path: '/organisation/billing/cancel' }),
    );
  });
});
