import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export type BiometricKind = 'face' | 'fingerprint';
/** What this device offers, e.g. `{ kind: 'face', label: 'Face ID' }`. */
export type BiometricSupport = { kind: BiometricKind; label: string };

const { FACIAL_RECOGNITION, FINGERPRINT } = LocalAuthentication.AuthenticationType;

/** What this phone offers for biometric sign-in; null when nothing is enrolled. */
export async function detectSupport(): Promise<BiometricSupport | null> {
  const [hardware, enrolled, types] = await Promise.all([
    LocalAuthentication.hasHardwareAsync(),
    LocalAuthentication.isEnrolledAsync(),
    LocalAuthentication.supportedAuthenticationTypesAsync(),
  ]);
  if (!hardware || !enrolled || !SecureStore.canUseBiometricAuthentication()) return null;
  if (Platform.OS === 'ios') {
    return types.includes(FACIAL_RECOGNITION)
      ? { kind: 'face', label: 'Face ID' }
      : { kind: 'fingerprint', label: 'Touch ID' };
  }
  // Android: the system prompt picks the method, so name it only when there's just one.
  if (types.length === 1 && types[0] === FACIAL_RECOGNITION) {
    return { kind: 'face', label: 'face unlock' };
  }
  return types.includes(FINGERPRINT) && types.length === 1
    ? { kind: 'fingerprint', label: 'fingerprint' }
    : { kind: 'fingerprint', label: 'biometrics' };
}
