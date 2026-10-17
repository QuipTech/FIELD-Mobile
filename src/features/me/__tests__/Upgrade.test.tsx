import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { PLAN_OPTIONS } from '../data';
import { Upgrade } from '../Upgrade';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

describe('Upgrade', () => {
  it('preselects the recommended plan and checks out with it', async () => {
    const onCheckout = jest.fn();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <Upgrade plans={PLAN_OPTIONS} onCheckout={onCheckout} />
      </SafeAreaProvider>,
    );

    expect(screen.getByRole('radio', { name: /^Standard, current plan/ })).toBeDisabled();
    expect(screen.getByRole('radio', { name: /^Enterprise/ })).toBeChecked();
    expect(screen.getByText('Recommended')).toBeTruthy();

    await fireEvent.press(screen.getByRole('button', { name: 'Continue to Stripe checkout' }));
    await waitFor(() => expect(onCheckout).toHaveBeenCalledTimes(1));
    expect(onCheckout.mock.calls[0]?.[0].id).toBe('enterprise');
  });

  it('cannot check out when already on every plan', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <Upgrade plans={PLAN_OPTIONS.filter((p) => p.current)} onCheckout={jest.fn()} />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('button', { name: 'Continue to Stripe checkout' })).toBeDisabled();
  });
});
