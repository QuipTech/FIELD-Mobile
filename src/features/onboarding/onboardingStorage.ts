import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const STORE_KEY = 'onboardingSeen';

type OnboardingState = {
  /** Null until read on launch. Device-level, so it is kept across sign-out. */
  seen: boolean | null;
};

/** M0.5 onboarding shows once per install: the first signed-out launch, then never again. */
export const useOnboarding = create<OnboardingState>(() => ({ seen: null }));

/** Reads the flag once on launch (before the first screen). */
export async function hydrateOnboarding() {
  try {
    useOnboarding.setState({ seen: (await AsyncStorage.getItem(STORE_KEY)) !== null });
  } catch {
    useOnboarding.setState({ seen: false }); // unreadable storage: show it rather than block launch
  }
}

/** Called from Skip or the last slide; the onboarding screen is guarded off from then on. */
export function markOnboardingSeen() {
  useOnboarding.setState({ seen: true });
  AsyncStorage.setItem(STORE_KEY, new Date().toISOString()).catch(() => undefined);
}
