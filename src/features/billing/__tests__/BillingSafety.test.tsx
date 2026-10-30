import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as WebBrowser from 'expo-web-browser';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useToastStore } from '@/components/Toast/store';
import { billingApi as mockApi, billingCalls, resetBillingApi } from '@/test/fakeBillingHttp';
import { DUE, ORG_SUMMARY, PAID } from '@/test/fixtures/billing';
import { BillingScreen } from '../BillingScreen';

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

const openAuthSession = WebBrowser.openAuthSessionAsync as jest.Mock;
const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const INVOICE_URL = 'https://invoice.stripe.com/i/acct_test/inv_2';
const toastMessage = () => useToastStore.getState().current?.message;

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

async function pay() {
  await fireEvent.press(await screen.findByRole('button', { name: 'Pay now' }));
  await fireEvent.changeText(screen.getByLabelText('Street address'), '1 Pit Rd');
  await fireEvent.changeText(screen.getByLabelText('Suburb or city'), 'Kalgoorlie');
  await fireEvent.press(screen.getByRole('togglebutton', { name: 'WA' }));
  await fireEvent.changeText(screen.getByLabelText('Postcode'), '6430');
  await fireEvent.press(screen.getByRole('button', { name: 'Continue to payment' }));
}

beforeEach(() => {
  resetBillingApi();
  mockRole.canManageBilling = false;
  openAuthSession.mockReset().mockResolvedValue({ type: 'cancel' });
  useToastStore.getState().dismiss();
});

describe('Stripe links', () => {
  it('refuses to open a payment link that is not on Stripe', async () => {
    mockApi['GET /me/billing'] = DUE;
    mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: 'https://evil.example/pay' };
    await setup();
    await pay();
    expect(
      await screen.findByText('The payment link could not be verified. Please contact support.'),
    ).toBeTruthy();
    expect(openAuthSession).not.toHaveBeenCalled();
  });

  it('says so when the user cancels on Stripe', async () => {
    mockApi['GET /me/billing'] = DUE;
    mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: INVOICE_URL };
    openAuthSession.mockResolvedValue({
      type: 'success',
      url: 'quiptechfield://billing-return?payment=cancelled',
    });
    await setup();
    await pay();
    await waitFor(() =>
      expect(toastMessage()).toBe('Payment cancelled. You have not been charged.'),
    );
  });

  it('thanks the user once the API confirms the payment', async () => {
    let paid = false;
    mockApi['GET /me/billing'] = () => (paid ? PAID : DUE);
    mockApi['POST /me/billing/payment'] = { ...DUE, paymentUrl: INVOICE_URL };
    openAuthSession.mockImplementation(async () => {
      paid = true;
      return { type: 'success', url: 'quiptechfield://billing-return?payment=complete' };
    });
    await setup();
    await pay();
    await waitFor(() => expect(toastMessage()).toBe('Payment received. Thank you!'));
  });
});

describe('invoices', () => {
  it('pays an invoice that is still due on its Stripe page', async () => {
    mockApi['GET /me/billing'] = PAID;
    mockApi['GET /me/billing/invoices'] = [
      {
        invoiceId: 'i2',
        periodStart: '2026-10-01',
        status: 'synced',
        totalCents: 3190,
        hostedInvoiceUrl: INVOICE_URL,
      },
      {
        invoiceId: 'i1',
        periodStart: '2026-09-01',
        status: 'paid',
        totalCents: 3190,
        hostedInvoiceUrl: INVOICE_URL,
      },
      { invoiceId: 'i0', periodStart: '2026-08-01', status: 'final', totalCents: null },
    ];
    await setup();
    await fireEvent.press(await screen.findByRole('button', { name: 'Pay invoice, October 2026' }));
    await waitFor(() =>
      expect(openAuthSession).toHaveBeenCalledWith(INVOICE_URL, expect.any(String)),
    );
    expect(screen.queryByRole('button', { name: 'Pay invoice, September 2026' })).toBeNull();
    expect(screen.getByText('Being prepared')).toBeTruthy();
    await waitFor(() =>
      expect(billingCalls.some((c) => c.path === '/me/billing/payment/check')).toBe(true),
    );
  });
});

describe('organisation', () => {
  beforeEach(() => {
    mockRole.canManageBilling = true;
    mockApi['GET /me/billing'] = { ...PAID, exempt: true };
    mockApi['GET /organisation/billing/invoices'] = [
      {
        id: 'o1',
        status: 'synced',
        totalCents: 539000,
        amountPaidCents: 200000,
        hasPdf: true,
        hostedInvoiceUrl: INVOICE_URL,
        periodStart: '2026-09-01',
        createdAt: '2026-10-01',
      },
    ];
  });

  it('lets an admin pay an overdue invoice and shows what is paid', async () => {
    mockApi['GET /organisation/billing'] = ORG_SUMMARY;
    await setup();
    expect(await screen.findByText('A$5,390.00 · A$2,000.00 paid')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Pay invoice, September 2026' }));
    await waitFor(() =>
      expect(openAuthSession).toHaveBeenCalledWith(INVOICE_URL, expect.any(String)),
    );
    expect(screen.getByText(/Invoices for Mintek go to accounts@mintek.com.au\./)).toBeTruthy();
  });

  it('keeps Manage off until Stripe knows the organisation', async () => {
    mockApi['GET /organisation/billing'] = {
      ...ORG_SUMMARY,
      account: { ...ORG_SUMMARY.account, hasStripeCustomer: false },
    };
    await setup();
    expect(await screen.findByText(/Payment methods open once your first invoice/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Manage' })).toBeDisabled();
  });

  it('labels the monthly charge as above the commitment on annual plans', async () => {
    mockApi['GET /organisation/billing'] = {
      ...ORG_SUMMARY,
      plan: { ...ORG_SUMMARY.plan, term: 'annual', committedQty: 20 },
    };
    await setup();
    expect(await screen.findByText('Above your commitment so far, ex GST')).toBeTruthy();
  });
});
