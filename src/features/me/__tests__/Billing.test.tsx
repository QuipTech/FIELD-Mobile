import { fireEvent, render, screen } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Billing, type BillingProps } from '../Billing';
import { SAMPLE_BILLING } from '@/test/fixtures/me';
import type { BillingData } from '../data';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const setup = async (data: Partial<BillingData> = {}, isAdmin = true) => {
  const props: BillingProps = {
    data: { ...SAMPLE_BILLING, ...data },
    isAdmin,
    onManagePayment: jest.fn(),
    onDownloadInvoice: jest.fn(),
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Billing {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

describe('Billing — technician', () => {
  it('shows the plan and their own usage, read-only', async () => {
    await setup({}, false);
    expect(screen.getByText('Billing is managed by your company admin.')).toBeTruthy();
    expect(screen.getByText('142 / 500 queries')).toBeTruthy();
    expect(screen.getByRole('progressbar', { name: 'Your AI queries this period' })).toBeTruthy();
    expect(screen.queryByText('Wearable client seats')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Manage' })).toBeNull();
    expect(screen.queryByRole('button', { name: /^Download invoice/ })).toBeNull();
  });
});

describe('Billing — admin', () => {
  it('summarises the plan and allowance', async () => {
    await setup();
    expect(screen.getByText('Billed per asset, monthly · 42 assets')).toBeTruthy();
    expect(screen.getByText('14 Apr 2027')).toBeTruthy();
    expect(screen.getByText('3,140 / 4,000 queries')).toBeTruthy();
    expect(screen.getByRole('progressbar')).toHaveAccessibilityValue({
      min: 0,
      max: 4000,
      now: 3140,
    });
    expect(screen.getByText('Overage above the allowance is billed, not blocked.')).toBeTruthy();
  });

  it('explains overage once the allowance is used up', async () => {
    await setup({ allowance: { used: 4250, limit: 4000 } });
    expect(
      screen.getByText('250 over the allowance — billed as overage, not blocked.'),
    ).toBeTruthy();
  });

  it('lists add-ons, payment method and invoices', async () => {
    const props = await setup();
    expect(screen.getByText('Wearable client seats')).toBeTruthy();
    expect(screen.getByLabelText('Visa ending in 4242, via Stripe')).toBeTruthy();
    await fireEvent.press(screen.getByRole('button', { name: 'Manage' }));
    expect(props.onManagePayment).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Download invoice, 1 Feb 2027' }));
    expect(props.onDownloadInvoice).toHaveBeenCalledWith(props.data.invoices[1]);
  });

  it('handles an account with no add-ons or invoices', async () => {
    await setup({ addOns: [], invoices: [] });
    expect(screen.getByText('No add-ons on this plan')).toBeTruthy();
    expect(screen.getByText('No invoices yet')).toBeTruthy();
  });
});
