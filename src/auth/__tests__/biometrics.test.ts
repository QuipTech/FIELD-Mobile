import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

import {
  disableBiometricSignIn,
  enableBiometricSignIn,
  forgetBiometricSignIn,
  hydrateBiometrics,
  signInWithBiometrics,
  useBiometrics,
} from '../biometrics';

jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
}));
jest.mock('expo-secure-store', () => ({
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WHEN_UNLOCKED_THIS_DEVICE_ONLY',
  canUseBiometricAuthentication: jest.fn(),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
const mockSignIn = jest.fn();
jest.mock('../flows', () => ({
  signInWithEmail: (...args: unknown[]) => mockSignIn(...args),
}));
const mockRemember = jest.fn();
jest.mock('../sessionCredentials', () => ({
  rememberSessionCredentials: (...args: unknown[]) => mockRemember(...args),
  forgetSessionCredentialsOnSignOut: () => () => undefined,
}));

const local = jest.mocked(LocalAuthentication);
const store = jest.mocked(SecureStore);
const FACE_ID = { kind: 'face', label: 'Face ID' } as const;
const cognitoError = (name: string, message = name) => Object.assign(new Error(message), { name });

beforeEach(() => {
  jest.clearAllMocks();
  local.hasHardwareAsync.mockResolvedValue(true);
  local.isEnrolledAsync.mockResolvedValue(true);
  local.supportedAuthenticationTypesAsync.mockResolvedValue([2]);
  local.authenticateAsync.mockResolvedValue({ success: true });
  store.canUseBiometricAuthentication.mockReturnValue(true);
  store.getItemAsync.mockResolvedValue(null);
  store.setItemAsync.mockResolvedValue();
  store.deleteItemAsync.mockResolvedValue();
  useBiometrics.setState({ support: FACE_ID, email: 'tech@quiptech.com.au' });
});

describe('support', () => {
  it('names Face ID on a Face ID iPhone and reads the saved account', async () => {
    useBiometrics.setState({ support: null, email: null });
    store.getItemAsync.mockResolvedValue('tech@quiptech.com.au');
    await hydrateBiometrics();
    expect(useBiometrics.getState()).toMatchObject({
      support: FACE_ID,
      email: 'tech@quiptech.com.au',
    });
  });

  it('is unavailable when no face or finger is enrolled', async () => {
    local.isEnrolledAsync.mockResolvedValue(false);
    await hydrateBiometrics();
    expect(useBiometrics.getState().support).toBeNull();
  });
});

describe('turning it on and off', () => {
  it('saves the credentials behind biometrics without an extra prompt', async () => {
    useBiometrics.setState({ email: null });
    await expect(enableBiometricSignIn('a@b.co', 'pw')).resolves.toBe(true);
    expect(local.authenticateAsync).not.toHaveBeenCalled();
    expect(store.setItemAsync).toHaveBeenCalledWith(
      'fieldBiometricCredentials',
      JSON.stringify({ email: 'a@b.co', password: 'pw' }),
      expect.objectContaining({ requireAuthentication: true }),
    );
    expect(useBiometrics.getState().email).toBe('a@b.co');
  });

  it('saves nothing when the person cancels the prompt', async () => {
    useBiometrics.setState({ email: null });
    // Android prompts while saving; cancelling rejects the save.
    store.setItemAsync.mockRejectedValueOnce(new Error('User canceled the authentication'));
    await expect(enableBiometricSignIn('a@b.co', 'pw')).resolves.toBe(false);
    expect(store.setItemAsync).toHaveBeenCalledTimes(1);
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('forgets only the matching account', async () => {
    await forgetBiometricSignIn('other@b.co');
    expect(useBiometrics.getState().email).toBe('tech@quiptech.com.au');
    await forgetBiometricSignIn('Tech@QuipTech.com.au');
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('turns off by deleting both items', async () => {
    await disableBiometricSignIn();
    expect(store.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(useBiometrics.getState().email).toBeNull();
  });
});

describe('signing in', () => {
  const saved = JSON.stringify({ email: 'tech@quiptech.com.au', password: 'pw' });

  it('unlocks the credentials and signs in with them', async () => {
    store.getItemAsync.mockResolvedValue(saved);
    mockSignIn.mockResolvedValue('done');
    await expect(signInWithBiometrics()).resolves.toBe('done');
    expect(mockSignIn).toHaveBeenCalledWith('tech@quiptech.com.au', 'pw');
    // So Me → Security can switch it straight back on this session.
    expect(mockRemember).toHaveBeenCalledWith('tech@quiptech.com.au', 'pw');
  });

  it('is quiet when the person cancels', async () => {
    store.getItemAsync.mockRejectedValue(new Error('User canceled the authentication'));
    await expect(signInWithBiometrics()).resolves.toBe('cancelled');
    expect(useBiometrics.getState().email).toBe('tech@quiptech.com.au');
  });

  it('turns off when a new face or finger invalidated the key', async () => {
    store.getItemAsync.mockResolvedValue(null);
    await expect(signInWithBiometrics()).rejects.toMatchObject({ name: 'BiometricError' });
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('turns off when the saved password stops working', async () => {
    store.getItemAsync.mockResolvedValue(saved);
    mockSignIn.mockRejectedValue(cognitoError('NotAuthorizedException', 'Incorrect password'));
    await expect(signInWithBiometrics()).rejects.toThrow(/no longer works/);
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('stays on when Cognito is only throttling', async () => {
    store.getItemAsync.mockResolvedValue(saved);
    mockSignIn.mockRejectedValue(
      cognitoError('NotAuthorizedException', 'Password attempts exceeded'),
    );
    await expect(signInWithBiometrics()).rejects.toThrow('Password attempts exceeded');
    expect(useBiometrics.getState().email).toBe('tech@quiptech.com.au');
  });
});
