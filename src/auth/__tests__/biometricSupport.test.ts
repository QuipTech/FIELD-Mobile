import * as LocalAuthentication from 'expo-local-authentication';

import { detectSupport } from '../biometricSupport';

jest.mock('expo-local-authentication', () => ({
  AuthenticationType: { FINGERPRINT: 1, FACIAL_RECOGNITION: 2, IRIS: 3 },
  hasHardwareAsync: jest.fn(async () => true),
  isEnrolledAsync: jest.fn(async () => true),
  supportedAuthenticationTypesAsync: jest.fn(async () => [2]),
}));
jest.mock('expo-secure-store', () => ({ canUseBiometricAuthentication: () => true }));

const local = jest.mocked(LocalAuthentication);

describe('detectSupport', () => {
  it('names Face ID on a Face ID iPhone', async () => {
    await expect(detectSupport()).resolves.toEqual({ kind: 'face', label: 'Face ID' });
  });

  it('is unavailable when no face or finger is enrolled', async () => {
    local.isEnrolledAsync.mockResolvedValueOnce(false);
    await expect(detectSupport()).resolves.toBeNull();
  });
});
