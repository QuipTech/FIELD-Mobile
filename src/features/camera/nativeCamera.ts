import { requireOptionalNativeModule } from 'expo';
import type * as ExpoCamera from 'expo-camera';

/**
 * expo-camera's native module only exists in builds made after it was added. Expo Router loads
 * every route at startup, so a plain import would crash an older dev build; load it only when
 * the native side is present, and let the camera screens show a fallback otherwise.
 */
function load(): typeof ExpoCamera | null {
  if (!requireOptionalNativeModule('ExpoCamera')) return null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-camera') as typeof ExpoCamera;
  } catch {
    return null;
  }
}

export const expoCamera = load();
