import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError, NetworkError } from '@/lib/http';
import { billingApi, billingCalls, resetBillingApi } from '@/test/fakeBillingHttp';
import { DUE, PAID } from '@/test/fixtures/billing';
import { PaymentRequired } from '../PaymentRequired';
import { StatusUnavailable } from '../StatusUnavailable';
import { usePaymentGate } from '../usePaymentGate';

jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http'),
  http: jest.requireActual('@/test/fakeBillingHttp').fakeHttp,
}));
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return {
    useFocusEffect: (effect: () => void) => useEffect(effect, [effect]),
    router: { push: (to: string) => mockPush(to) },
  };
});

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

async function renderWithClient(ui: React.ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <QueryClientProvider client={client}>
        <BottomSheetModalProvider>{ui}</BottomSheetModalProvider>
      </QueryClientProvider>
    </SafeAreaProvider>,
  );
}

function Gate({ enabled = true }: { enabled?: boolean }) {
  usePaymentGate(enabled);
  return null;
}

beforeEach(() => {
  resetBillingApi();
  mockPush.mockReset();
});

describe('payment gate on Home', () => {
  it('opens Payment required while the fee is unpaid', async () => {
    billingApi['GET /me/billing'] = DUE;
    await renderWithClient(<Gate />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/payment-required'));
  });

  it.each([
    ['paid', PAID],
    ['an Owner', { ...PAID, exempt: true }],
    ['covered by an organisation seat', { ...PAID, coveredByOrganisation: true }],
  ])('stays closed when the user is %s', async (_, status) => {
    billingApi['GET /me/billing'] = status;
    await renderWithClient(<Gate />);
    await waitFor(() =>
      expect(billingCalls).toContainEqual({ method: 'GET', path: '/me/billing' }),
    );
    // Let the answer render before checking nothing opened.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('blocks when the API answers with a server error', async () => {
    billingApi['GET /me/billing'] = () => {
      throw new ApiError(503, 'Service unavailable');
    };
    await renderWithClient(<Gate />);
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/payment-required'));
  });

  it('never blocks when the device is offline', async () => {
    billingApi['GET /me/billing'] = () => {
      throw new NetworkError('Network request failed');
    };
    await renderWithClient(<Gate />);
    await waitFor(() =>
      expect(billingCalls).toContainEqual({ method: 'GET', path: '/me/billing' }),
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('waits while the first-run guide is showing', async () => {
    billingApi['GET /me/billing'] = DUE;
    await renderWithClient(<Gate enabled={false} />);
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe('Payment required popup', () => {
  const props = {
    status: DUE,
    webBillingUrl: 'https://web.test/settings/billing',
    paying: false,
    checking: false,
    onPay: jest.fn(),
    onCheckAgain: jest.fn(),
    onSignOut: jest.fn(),
    onDeleteAccount: jest.fn(),
  };

  it('shows the fee and lets the user pay or sign out', async () => {
    await renderWithClient(<PaymentRequired {...props} checkout="in-app" />);
    expect(screen.getByText('Your subscription is due')).toBeTruthy();
    expect(screen.getByText('Due · October 2026')).toBeTruthy();
    expect(screen.getByText('A$29.00')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Pay now' }));
    expect(screen.getByLabelText('Street address')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(props.onSignOut).toHaveBeenCalledTimes(1);
  });

  it('asks the API again after paying on the web portal', async () => {
    await renderWithClient(<PaymentRequired {...props} checkout="web" />);
    expect(screen.queryByRole('button', { name: 'Pay now' })).toBeNull();
    await fireEvent.press(screen.getByRole('button', { name: "I've paid, check again" }));
    expect(props.onCheckAgain).toHaveBeenCalledTimes(1);
  });
});

describe('Subscription status unavailable popup', () => {
  it('offers Try again and Sign out', async () => {
    const onRetry = jest.fn();
    const onSignOut = jest.fn();
    await renderWithClient(
      <StatusUnavailable
        message="Something went wrong on our side. Try again."
        retrying={false}
        onRetry={onRetry}
        onSignOut={onSignOut}
      />,
    );
    expect(screen.getByText('Subscription status unavailable')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Sign out' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
    expect(onSignOut).toHaveBeenCalledTimes(1);
  });
});
