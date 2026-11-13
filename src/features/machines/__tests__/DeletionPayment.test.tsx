import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { presentPaymentSheet } from '@stripe/stripe-react-native';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { TurboModuleRegistry } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { toast } from '@/components/Toast/store';
import { http } from '@/lib/http';
import { DeletionBlocked } from '../DeletionBlocked';
import type { DeletionCheck } from '../lifecycleApi';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'dismiss' })),
  WebBrowserPresentationStyle: { PAGE_SHEET: 'pageSheet' },
}));

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const BLOCKED: DeletionCheck = {
  canDelete: false,
  blocker: 'final_charge_due',
  message: null,
  finalInvoiceFrom: null,
  unpaidInvoices: [],
  finalCharge: {
    amountCents: 1550,
    months: [
      {
        periodStart: '2026-11-01',
        lastUsedOn: '2026-11-10',
        daysUsed: 10,
        daysInMonth: 30,
        monthlyRateCents: 4650,
        amountCents: 1550,
      },
    ],
  },
};

describe('paying the final charge', () => {
  // Pretend this binary includes Stripe's native module.
  beforeEach(() => {
    jest
      .spyOn(TurboModuleRegistry, 'get')
      .mockImplementation((name: string) => (name === 'StripeSdk' ? {} : null) as never);
  });
  afterEach(() => jest.restoreAllMocks());

  const SHEET = { publishableKey: 'pk_test_1', paymentIntentClientSecret: 'pi_1_secret_2' };
  const renderBlocked = (
    check: DeletionCheck,
    onRecheck: () => Promise<DeletionCheck | undefined>,
  ) =>
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SafeAreaProvider initialMetrics={metrics}>
          <DeletionBlocked
            machineId="m1"
            check={check}
            onRecheck={onRecheck}
            onDeactivate={jest.fn()}
          />
        </SafeAreaProvider>
      </QueryClientProvider>,
    );

  it('takes the final charge in the payment sheet, then checks until it clears', async () => {
    jest.spyOn(http, 'post').mockResolvedValue({ ...BLOCKED, paymentSheet: SHEET });
    const onRecheck = jest.fn(async () => ({ ...BLOCKED, canDelete: true, blocker: null }));
    await renderBlocked(BLOCKED, onRecheck);
    await fireEvent.press(screen.getByRole('button', { name: 'Pay final charge' }));
    await waitFor(() => expect(onRecheck).toHaveBeenCalled());
    expect(presentPaymentSheet).toHaveBeenCalled();
  });

  it('keeps the Pay button when the sheet is cancelled or fails', async () => {
    const show = jest.spyOn(toast, 'show');
    jest.spyOn(http, 'post').mockResolvedValue({ ...BLOCKED, paymentSheet: SHEET });
    jest
      .mocked(presentPaymentSheet)
      .mockResolvedValueOnce({ error: { code: 'Canceled', message: 'x' } } as never)
      .mockResolvedValueOnce({ error: { code: 'Failed', message: 'Card declined' } } as never);
    const onRecheck = jest.fn(async () => BLOCKED);
    await renderBlocked(BLOCKED, onRecheck);

    await fireEvent.press(screen.getByRole('button', { name: 'Pay final charge' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith(expect.stringMatching(/cancelled/)));
    await fireEvent.press(screen.getByRole('button', { name: 'Pay final charge' }));
    await waitFor(() => expect(show).toHaveBeenCalledWith('Card declined'));
    expect(screen.getByRole('button', { name: 'Pay final charge' })).toBeTruthy();
  });

  it('still offers Pay for a final charge whose invoice is a draft', async () => {
    await renderBlocked(
      {
        ...BLOCKED,
        blocker: 'unpaid_invoices',
        finalCharge: null,
        unpaidInvoices: [
          { id: 'in1', status: 'draft', hostedInvoiceUrl: null, isFinalCharge: true },
        ],
      },
      jest.fn(async () => BLOCKED),
    );
    expect(screen.getByText('Awaiting payment')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Pay' })).toBeTruthy();
  });
});
