import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Register, type RegisterProps } from '../Register';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const setup = async () => {
  const props: RegisterProps = {
    onSubmit: jest.fn(async () => undefined),
    onGoogle: jest.fn(),
    onApple: jest.fn(),
    onSignIn: jest.fn(),
  };
  await render(
    <SafeAreaProvider initialMetrics={metrics}>
      <Register {...props} />
    </SafeAreaProvider>,
  );
  return props;
};

const fill = async (overrides: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    'First name': 'Sam',
    'Last name': 'Lee',
    'Company name': 'QuipTech Mining',
    'Work email': 'sam@quiptech.com.au',
    'Phone number': '+61 400 123 456',
    Password: 'Str0ng!pass',
    ...overrides,
  };
  for (const [label, value] of Object.entries(values)) {
    await fireEvent.changeText(screen.getByLabelText(label), value);
  }
};

describe('Register', () => {
  it('shows an error for every empty field and does not submit', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Enter your first name')).toBeTruthy();
    expect(screen.getByText('Enter your last name')).toBeTruthy();
    expect(screen.getByText('Enter your company name')).toBeTruthy();
    expect(screen.getByText('Enter a valid work email')).toBeTruthy();
    expect(screen.getByText('Include your country code, e.g. +61 400 123 456')).toBeTruthy();
    expect(screen.getByText('Use at least 8 characters')).toBeTruthy();
    expect(screen.getByText('Accept the terms to continue')).toBeTruthy();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('requires the terms to be accepted', async () => {
    const props = await setup();
    await fill();
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByText('Accept the terms to continue')).toBeTruthy();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits trimmed values once everything is valid', async () => {
    const props = await setup();
    await fill({ 'First name': '  Sam  ' });
    const terms = screen.getByRole('checkbox');
    await fireEvent.press(terms);
    expect(terms).toBeChecked();
    await fireEvent.press(screen.getByRole('button', { name: 'Create account' }));
    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1));
    expect(jest.mocked(props.onSubmit).mock.calls[0]?.[0]).toEqual({
      firstName: 'Sam',
      lastName: 'Lee',
      company: 'QuipTech Mining',
      email: 'sam@quiptech.com.au',
      phone: '+61400123456', // normalised to E.164 for Cognito
      password: 'Str0ng!pass',
      acceptTerms: true,
    });
  });

  it('links back to sign in', async () => {
    const props = await setup();
    await fireEvent.press(screen.getByRole('link', { name: 'Sign in' }));
    expect(props.onSignIn).toHaveBeenCalledTimes(1);
  });
});
