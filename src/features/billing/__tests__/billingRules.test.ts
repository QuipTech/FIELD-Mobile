import { Alert } from 'react-native';

import { ApiError, errorMessage } from '@/lib/http';
import { validateAddress } from '../address';
import { formatBillingMonth, formatCents, formatPeriod } from '../format';
import { handlePlanError } from '../planErrors';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({ router: { push: (to: string) => mockPush(to) } }));
jest.mock('../entitlements', () => ({ refreshEntitlements: jest.fn() }));

describe('billing formatting', () => {
  it('shows integer cents as dollars only when displayed', () => {
    expect(formatCents(2900)).toBe('A$29.00');
    expect(formatCents(123456)).toBe('A$1,234.56');
  });

  it('treats billing days as calendar days with an exclusive end', () => {
    expect(formatBillingMonth('2026-11-01')).toBe('November 2026');
    expect(formatPeriod('2026-02-01', '2026-03-01')).toBe('1 Feb 2026 – 28 Feb 2026');
  });
});

describe('billing address', () => {
  it('accepts an Australian address', () => {
    expect(
      validateAddress({ line1: ' 1 Pit Rd ', city: 'Perth', state: 'WA', postalCode: '6000' }),
    ).toEqual({ address: { line1: '1 Pit Rd', city: 'Perth', state: 'WA', postalCode: '6000' } });
  });

  it('rejects a postcode that is not exactly 4 digits', () => {
    const result = validateAddress({ line1: 'a', city: 'b', state: 'NSW', postalCode: '20000' });
    expect(result).toEqual({ errors: { postalCode: 'Postcodes are 4 digits' } });
  });
});

describe('plan errors', () => {
  it('explains a suspended account wherever a request fails', () => {
    expect(errorMessage(new ApiError(403, 'Account suspended', 'account_suspended'))).toBe(
      'Your account is suspended for an overdue invoice. Contact your organisation admin.',
    );
  });

  it('offers Billing when a feature is not in the plan', () => {
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    handlePlanError(
      new ApiError(403, 'Registering machines needs Asset Pro.', 'feature_not_in_plan'),
    );
    expect(alert).toHaveBeenCalledWith(
      'Not included in your plan',
      'Registering machines needs Asset Pro.',
      expect.any(Array),
    );
    const buttons = alert.mock.calls[0]![2]!;
    buttons.find((b) => b.text === 'View billing')!.onPress!();
    expect(mockPush).toHaveBeenCalledWith('/billing');

    // Ordinary 403s are left to the screen.
    alert.mockClear();
    handlePlanError(new ApiError(403, 'Forbidden'));
    expect(alert).not.toHaveBeenCalled();
  });
});
