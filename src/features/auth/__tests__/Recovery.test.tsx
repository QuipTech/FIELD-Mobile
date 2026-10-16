import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import type { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { EnterCode } from '../EnterCode';
import { ForgotPassword } from '../ForgotPassword';
import { NewPassword } from '../NewPassword';
import { maskPhone, TwoFactorMethod } from '../TwoFactorMethod';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};
const renderScreen = (ui: ReactElement) =>
  render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);
const firstArg = (fn: jest.Mock) => fn.mock.calls[0]?.[0];

describe('ForgotPassword (M1c)', () => {
  it('validates the email, then submits it', async () => {
    const onSubmit = jest.fn(async () => undefined);
    await renderScreen(<ForgotPassword onSubmit={onSubmit} onBackToSignIn={jest.fn()} />);
    await fireEvent.press(screen.getByRole('button', { name: 'Send reset code' }));
    expect(await screen.findByText('Enter a valid work email')).toBeTruthy();

    await fireEvent.changeText(screen.getByLabelText('Work email'), 'j.okoye@quiptech.com');
    await fireEvent.press(screen.getByRole('button', { name: 'Send reset code' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(firstArg(onSubmit)).toEqual({ email: 'j.okoye@quiptech.com' });
  });
});

describe('EnterCode (M1d)', () => {
  const setup = async () => {
    const onSubmit = jest.fn(async () => undefined);
    await renderScreen(
      <EnterCode destination="j.okoye@quiptech.com" onSubmit={onSubmit} onResend={jest.fn()} />,
    );
    return { onSubmit, input: screen.getByLabelText('6-digit verification code') };
  };

  it('asks for all six digits before verifying', async () => {
    const { onSubmit, input } = await setup();
    expect(screen.getByText('Sent to j.okoye@quiptech.com')).toBeTruthy();
    await fireEvent.changeText(input, '482');
    await fireEvent.press(screen.getByRole('button', { name: 'Verify code' }));
    expect(screen.getByText('Enter the 6-digit code')).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('keeps digits only and verifies automatically once complete (paste / autofill)', async () => {
    const { onSubmit, input } = await setup();
    await fireEvent.changeText(input, '48 2-913');
    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith('482913'));
  });
});

describe('NewPassword (M1e)', () => {
  const setup = async () => {
    const onSubmit = jest.fn(async () => undefined);
    await renderScreen(<NewPassword onSubmit={onSubmit} />);
    const fill = async (password: string, confirm: string) => {
      await fireEvent.changeText(screen.getByLabelText('New password'), password);
      await fireEvent.changeText(screen.getByLabelText('Confirm password'), confirm);
      await fireEvent.press(screen.getByRole('button', { name: 'Update password' }));
    };
    return { onSubmit, fill };
  };

  it.each([
    ['short1!', 'Use at least 8 characters'],
    ['longenough!', 'Include at least one number'],
    ['longenough1', 'Include at least one symbol'],
    ['longenough1!', 'Include at least one uppercase letter'],
    ['LONGENOUGH1!', 'Include at least one lowercase letter'],
  ])('rejects %s', async (password, message) => {
    const { onSubmit, fill } = await setup();
    await fill(password, password);
    expect(await screen.findByText(message)).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('requires the confirmation to match', async () => {
    const { onSubmit, fill } = await setup();
    await fill('Field2026!', 'Field2026?');
    expect(await screen.findByText("Passwords don't match")).toBeTruthy();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid password', async () => {
    const { onSubmit, fill } = await setup();
    await fill('Field2026!', 'Field2026!');
    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(firstArg(onSubmit)).toEqual({ password: 'Field2026!', confirm: 'Field2026!' });
  });
});

describe('TwoFactorMethod (M1f)', () => {
  it('masks the phone number', () => {
    expect(maskPhone('+61 400 123 214')).toBe('•••• 214');
  });

  it('defaults to SMS and continues with the chosen method', async () => {
    const onContinue = jest.fn(async () => undefined);
    await renderScreen(
      <TwoFactorMethod phone="+61400123214" email="j.okoye@quiptech.com" onContinue={onContinue} />,
    );
    const sms = screen.getByRole('radio', { name: /Text message/ });
    const email = screen.getByRole('radio', { name: /Email code/ });
    expect(sms).toBeChecked();
    expect(screen.getByText('Codes sent to •••• 214')).toBeTruthy();

    await fireEvent.press(email);
    expect(email).toBeChecked();
    expect(sms).not.toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Continue' }));
    await waitFor(() => expect(onContinue).toHaveBeenCalledWith('email'));
  });
});
