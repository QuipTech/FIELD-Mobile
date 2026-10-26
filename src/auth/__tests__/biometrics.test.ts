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
const mockCreateKey = jest.fn();
const mockDeleteKey = jest.fn();
const mockKeySignIn = jest.fn();
jest.mock('../deviceKey', () => ({
  createDeviceKey: () => mockCreateKey(),
  deleteDeviceKey: (id: string) => mockDeleteKey(id),
  signInWithDeviceKey: (key: unknown) => mockKeySignIn(key),
  isKeyRevoked: (error: { status?: number }) => error.status === 404,
}));
const mockSetStatus = jest.fn();
jest.mock('../session', () => ({
  useSession: { getState: () => ({ setStatus: mockSetStatus }) },
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
  mockCreateKey.mockResolvedValue(null); // the API has no device keys: saves the password
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
});

describe('turning it on and off', () => {
  it('saves the credentials behind biometrics without an extra prompt', async () => {
    useBiometrics.setState({ email: null });
    await expect(enableBiometricSignIn('a@b.co', 'pw')).resolves.toBe('on');
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
    await expect(enableBiometricSignIn('a@b.co', 'pw')).resolves.toBe('cancelled');
    expect(store.setItemAsync).toHaveBeenCalledTimes(1);
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('registers a device key when the API offers them, keeping no password', async () => {
    useBiometrics.setState({ email: null });
    mockCreateKey.mockResolvedValue({ keyId: 'k1', secretKey: 'c2VjcmV0' });
    await expect(enableBiometricSignIn('a@b.co')).resolves.toBe('on');
    expect(store.setItemAsync).toHaveBeenCalledWith(
      'fieldBiometricCredentials',
      JSON.stringify({ email: 'a@b.co', keyId: 'k1', secretKey: 'c2VjcmV0' }),
      expect.objectContaining({ requireAuthentication: true }),
    );
    expect(store.setItemAsync).toHaveBeenCalledWith('fieldBiometricKeyId', 'k1');
  });

  it('revokes the new key when the person cancels saving it', async () => {
    mockCreateKey.mockResolvedValue({ keyId: 'k1', secretKey: 's' });
    store.setItemAsync.mockRejectedValueOnce(new Error('User canceled the authentication'));
    await expect(enableBiometricSignIn('a@b.co')).resolves.toBe('cancelled');
    expect(mockDeleteKey).toHaveBeenCalledWith('k1');
  });

  it('asks for the password when there is neither a device key nor a password', async () => {
    await expect(enableBiometricSignIn('a@b.co')).resolves.toBe('needsPassword');
    expect(store.setItemAsync).not.toHaveBeenCalled();
  });

  it('forgets only the matching account', async () => {
    await forgetBiometricSignIn('other@b.co');
    expect(useBiometrics.getState().email).toBe('tech@quiptech.com.au');
    await forgetBiometricSignIn('Tech@QuipTech.com.au');
    expect(useBiometrics.getState().email).toBeNull();
  });

  it('turns off by deleting the items and revoking the device key', async () => {
    store.getItemAsync.mockResolvedValue('k1');
    await disableBiometricSignIn();
    expect(store.deleteItemAsync).toHaveBeenCalledTimes(3);
    expect(mockDeleteKey).toHaveBeenCalledWith('k1');
    expect(useBiometrics.getState().email).toBeNull();
  });
});

describe('signing in', () => {
  const saved = JSON.stringify({ email: 'tech@quiptech.com.au', password: 'pw' });
  const key = { email: 'tech@quiptech.com.au', keyId: 'k1', secretKey: 'c2VjcmV0' };

  it('unlocks the credentials and signs in with them', async () => {
    store.getItemAsync.mockResolvedValue(saved);
    mockSignIn.mockResolvedValue('done');
    await expect(signInWithBiometrics()).resolves.toBe('done');
    expect(mockSignIn).toHaveBeenCalledWith('tech@quiptech.com.au', 'pw');
    // So Me → Security can switch it straight back on this session.
    expect(mockRemember).toHaveBeenCalledWith('tech@quiptech.com.au', 'pw');
  });

  it('signs the API challenge with the device key', async () => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(key));
    mockKeySignIn.mockResolvedValue(undefined);
    await expect(signInWithBiometrics()).resolves.toBe('done');
    expect(mockKeySignIn).toHaveBeenCalledWith(key);
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockSetStatus).toHaveBeenCalledWith('signedIn');
  });

  it('turns off when the API has revoked the device key', async () => {
    store.getItemAsync.mockResolvedValue(JSON.stringify(key));
    mockKeySignIn.mockRejectedValue(Object.assign(new Error('Gone'), { status: 404 }));
    await expect(signInWithBiometrics()).rejects.toThrow(/turned off for this phone/);
    expect(useBiometrics.getState().email).toBeNull();
    expect(mockSetStatus).not.toHaveBeenCalled();
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
