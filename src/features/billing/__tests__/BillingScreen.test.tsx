import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ApiError } from '@/lib/http';
import { BillingScreen } from '../BillingScreen';
import {
  billingApi as mockApi,
  billingCalls as mockCalls,
  resetBillingApi,
} from '@/test/fakeBillingHttp';
import { DUE, PAID } from '@/test/fixtures/billing';

jest.mock('@/lib/http', () => ({
  ...jest.requireActual('@/lib/http'),
  http: jest.requireActual('@/test/fakeBillingHttp').fakeHttp,
}));

const mockRole = { canManageBilling: false, capabilities: { canUseAi: false } };
jest.mock('@/auth/useRole', () => ({ useRole: () => mockRole }));
const mockCheckout = { mode: 'in-app' as 'in-app' | 'web' };
jest.mock('../stripeBrowser', () => ({
  ...jest.requireActual('../stripeBrowser'),
  personalCheckoutMode: () => mockCheckout.mode,
}));
jest.mock('expo-router', () => {
  const { useEffect } = jest.requireActual('react');
  return { useFocusEffect: (effect: () => void) => useEffect(effect, [effect]), router: {} };
});

const openAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;
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

async function enterAddress() {
  await fireEvent.press(await screen.findByRole('button', { name: 'Pay now' }));
  await fireEvent.changeText(screen.getByLabelText('Street address'), '1 Pit Rd');
  await fireEvent.changeText(screen.getByLabelText('Suburb or city'), 'Kalgoorlie');
  await fireEvent.press(screen.getByRole('button', { name: 'Choose' }));
  await fireEvent.press(screen.getByLabelText('WA'));
  await fireEvent.changeText(screen.getByLabelText('Postcode'), '6430');
  await fireEvent.press(screen.getByRole('button', { name: 'Continue to payment' }));
}

const ADDRESS = { line1: '1 Pit Rd', city: 'Kalgoorlie', state: 'WA', postalCode: '6430' };
const PAY_URL = 'https://invoice.stripe.com/i/acct_test/inv_1';

beforeEach(() => {
  resetBillingApi();
  mockRole.canManageBilling = false;
  mockCheckout.mode = 'in-app';
  openAuthSession.mockReset().mockResolvedValue({ type: 'cancel' });
});

describe('Billing — personal', () => {
  it('shows an Owner that no payment is needed', async () => {
    mockApi['GET /me/billing'] = { ...PAID, exempt: true };
    await setup();
    expect(await screen.findByText('No payment needed')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pay now' })).toBeNull();
  });

  it('never asks a member covered by an organisation seat to pay', async () => {
    mockApi['GET /me/billing'] = { ...PAID, coveredByOrganisation: true };
    await setup();
    expect(await screen.findByText('Covered by your organisation')).toBeTruthy();
    expect(screen.queryByText('Your invoices')).toBeNull();
  });

  it('shows the price and period when payment is due', async () => {
    mockApi['GET /me/billing'] = DUE;
    await setup();
    expect(await screen.findByText('A$29.00')).toBeTruthy();
    expect(screen.getByText('1 Oct 2026 – 31 Oct 2026')).toBeTruthy();
  });

  it('shows paid after the browser is closed before Stripe redirects', async () => {
    let paid = false;
    mockApi['GET /me/billing'] = () => (paid ? PAID : DUE);
    mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: PAY_URL };
    // The user pays, then closes the browser; no redirect, no webhook yet.
    openAuthSession.mockImplementation(async () => {
      paid = true;
      return { type: 'cancel' };
    });
    await setup();
    await enterAddress();

    expect(await screen.findByText('Paid for this month')).toBeTruthy();
    expect(mockCalls).toContainEqual({
      method: 'POST',
      path: '/me/billing/payment',
      body: ADDRESS,
    });
    expect(openAuthSession).toHaveBeenCalledWith(PAY_URL, expect.any(String));
    const check = mockCalls.findIndex((c) => c.path === '/me/billing/payment/check');
    const reread = mockCalls.findLastIndex((c) => c.method === 'GET' && c.path === '/me/billing');
    expect(check).toBeGreaterThan(-1);
    expect(reread).toBeGreaterThan(check);
  });

  it.each(['cancelled on the Stripe page', 'declined (4000 0000 0000 0002)'])(
    'stays unpaid when the payment is %s',
    async () => {
      mockApi['GET /me/billing'] = DUE;
      mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: PAY_URL };
      await setup();
      await enterAddress();
      await waitFor(() => expect(mockCalls.some((c) => c.path.endsWith('/check'))).toBe(true));
      expect(screen.getByText('Due')).toBeTruthy();
      // The address is kept, so paying again is one tap.
      expect(screen.getByRole('button', { name: 'Pay now' })).toBeTruthy();
      expect(screen.queryByText('Paid for this month')).toBeNull();
    },
  );

  it('refreshes without opening Stripe when the month is already paid', async () => {
    mockApi['GET /me/billing'] = DUE;
    mockApi['POST /me/billing/payment'] = { ...PAID, paymentUrl: null };
    await setup();
    await enterAddress();
    await waitFor(() => expect(mockCalls.some((c) => c.path.endsWith('/check'))).toBe(true));
    expect(openAuthSession).not.toHaveBeenCalled();
  });

  it('checks the address on the device before sending it', async () => {
    mockApi['GET /me/billing'] = DUE;
    await setup();
    await fireEvent.press(await screen.findByRole('button', { name: 'Pay now' }));
    await fireEvent.changeText(screen.getByLabelText('Postcode'), '643');
    await fireEvent.press(screen.getByRole('button', { name: 'Continue to payment' }));
    expect(screen.getByText('Enter your street address')).toBeTruthy();
    expect(screen.getByText('Choose your state or territory')).toBeTruthy();
    expect(screen.getByText('Postcodes are 4 digits')).toBeTruthy();
    expect(mockCalls.some((c) => c.method === 'POST')).toBe(false);
  });

  it('shows a 400 message and lets the user try again after a Stripe failure', async () => {
    mockApi['GET /me/billing'] = DUE;
    mockApi['POST /me/billing/payment'] = () => {
      throw new ApiError(400, 'postalCode must match /^\\d{4}$/');
    };
    await setup();
    await enterAddress();
    expect(await screen.findByText('postalCode must match /^\\d{4}$/')).toBeTruthy();

    mockApi['POST /me/billing/payment'] = () => {
      throw new ApiError(502, 'Stripe unavailable');
    };
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Something went wrong on our side. Try again.')).toBeTruthy();

    mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: PAY_URL };
    await fireEvent.press(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(openAuthSession).toHaveBeenCalledTimes(1));
  });

  it('only shows the status when this platform pays on the web portal', async () => {
    mockCheckout.mode = 'web';
    mockApi['GET /me/billing'] = DUE;
    await setup();
    expect(
      await screen.findByText(/Pay for this month from Billing on the FIELD website/),
    ).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Pay now' })).toBeNull();
  });

  it('lists invoices and says when tax is still being calculated', async () => {
    mockApi['GET /me/billing'] = PAID;
    mockApi['GET /me/billing/invoices'] = [
      { invoiceId: 'i2', periodStart: '2026-10-01', status: 'open', totalCents: null },
      { invoiceId: 'i1', periodStart: '2026-09-01', status: 'paid', totalCents: 3190 },
    ];
    await setup();
    expect(await screen.findByText('Calculating tax…')).toBeTruthy();
    expect(screen.getByText('A$31.90')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Download invoice, September 2026' })).toBeTruthy();
  });
});
