import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { create } from 'zustand';

import { palettes, type ColorScheme, type ThemeColors } from './palette';

/** The Profile setting: follow the OS, or force a theme. */
export type ThemePreference = 'system' | ColorScheme;

const STORE_KEY = 'themePreference';

type PreferenceState = {
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

/** Device-level setting, so it is kept across sign-out. */
export const useThemePreference = create<PreferenceState>((set) => ({
  preference: 'system',
  setPreference: (preference) => {
    set({ preference });
    AsyncStorage.setItem(STORE_KEY, preference).catch(() => undefined);
  },
}));

/** Reads the saved preference once on launch (before the first screen). */
export async function hydrateThemePreference() {
  try {
    const saved = await AsyncStorage.getItem(STORE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'system') {
      useThemePreference.setState({ preference: saved });
    }
  } catch {
    // Unreadable storage: stay on "system".
  }
}

export type Theme = { scheme: ColorScheme; colors: ThemeColors };

/** The active scheme and its colours. Re-renders when the OS theme or the setting changes. */
export function useTheme(): Theme {
  const system = useColorScheme();
  const preference = useThemePreference((s) => s.preference);
  const scheme: ColorScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;
  return { scheme, colors: palettes[scheme] };
}
