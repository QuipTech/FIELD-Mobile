import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { SignIn, type SignInProps } from '../SignIn';

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

const renderSignIn = (overrides: Partial<SignInProps> = {}) => {
  const props: SignInProps = {
    onSubmit: jest.fn(async () => undefined),
    onGoogle: jest.fn(),
    onApple: jest.fn(),
    onBiometric: jest.fn(),
    onCreateAccount: jest.fn(),
    onForgotPassword: jest.fn(),
    ...overrides,
  };
  return {
    props,
    view: render(
      <SafeAreaProvider initialMetrics={metrics}>
        <SignIn {...props} />
      </SafeAreaProvider>,
    ),
  };
};

describe('SignIn', () => {
  it('offers Apple sign-in on iOS only', async () => {
    // jest-expo's default preset runs as iOS.
    const { view } = renderSignIn();
    await view;
    expect(screen.getByRole('button', { name: 'Continue with Apple' })).toBeTruthy();
  });

  it('shows validation errors and does not submit an empty form', async () => {
    const { props, view } = renderSignIn();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Enter a valid work email')).toBeTruthy();
    expect(screen.getByText('Enter your password')).toBeTruthy();
    expect(props.onSubmit).not.toHaveBeenCalled();
  });

  it('submits email and password', async () => {
    const { props, view } = renderSignIn();
    await view;
    await fireEvent.changeText(screen.getByLabelText('Work email'), 'tech@quiptech.com.au');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret');
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in' }));
    await waitFor(() => expect(props.onSubmit).toHaveBeenCalledTimes(1));
    expect(jest.mocked(props.onSubmit).mock.calls[0]?.[0]).toEqual({
      email: 'tech@quiptech.com.au',
      password: 'secret',
    });
  });

  it('offers biometric sign-in only once it is set up', async () => {
    const { view } = renderSignIn();
    await view;
    expect(screen.queryByRole('button', { name: /Face ID/ })).toBeNull();
  });

  it('signs in with Face ID when set up', async () => {
    const { props, view } = renderSignIn({ biometric: { kind: 'face', label: 'Face ID' } });
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Sign in with Face ID' }));
    expect(props.onBiometric).toHaveBeenCalledTimes(1);
  });

  it('shows the app version at the bottom', async () => {
    const { view } = renderSignIn({ version: '1.0.0' });
    await view;
    expect(screen.getByText('Version 1.0.0')).toBeTruthy();
  });

  it('routes social and link actions', async () => {
    const { props, view } = renderSignIn();
    await view;
    await fireEvent.press(screen.getByRole('button', { name: 'Continue with Google' }));
    await fireEvent.press(screen.getByRole('link', { name: 'Forgot password' }));
    expect(props.onGoogle).toHaveBeenCalledTimes(1);
    expect(props.onForgotPassword).toHaveBeenCalledTimes(1);
  });
});
