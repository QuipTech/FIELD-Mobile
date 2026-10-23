import { DarkTheme, DefaultTheme, type NativeStackNavigationOptions } from 'expo-router';
import { useMemo } from 'react';
import { Platform } from 'react-native';

import { palettes, type ColorScheme } from './palette';
import { fontFamily } from './tokens';
import { durations } from './motion';
import { useTheme } from './useTheme';

/** React Navigation theme, so native-stack backgrounds and transitions follow the scheme. */
export function navigationTheme(scheme: ColorScheme) {
  const c = palettes[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: c.primary,
      background: c.bg,
      card: c.card,
      text: c.ink,
      border: c.border,
      notification: c.danger,
    },
  };
}

export type NavigationOptions = {
  stack: NativeStackNavigationOptions;
  /** Card-coloured bar with a hairline and a left-aligned title (`.pbar` in the design). */
  header: (title: string) => NativeStackNavigationOptions;
  /** Same bar over a card-coloured screen (auth forms). */
  authHeader: (title: string) => NativeStackNavigationOptions;
  /** iOS: only a back chevron, top left, over the screen. Android: no bar (system back). */
  backOnly: NativeStackNavigationOptions;
};

/** Header and stack options for the active scheme. */
export function useNavigationOptions(): NavigationOptions {
  const { scheme, colors: c } = useTheme();
  return useMemo(() => {
    const header = (title: string): NativeStackNavigationOptions => ({
      title,
      headerTitleAlign: 'left',
      headerShadowVisible: true,
      headerStyle: { backgroundColor: c.card },
      headerTintColor: c.ink,
      headerTitleStyle: { fontFamily: fontFamily.semibold, fontSize: 17, color: c.ink },
      headerBackButtonDisplayMode: 'minimal',
      contentStyle: { backgroundColor: c.bg },
    });
    return {
      stack: {
        ...header(''),
        headerShadowVisible: false,
        // Native-stack default transition (iOS slide / Android fade-through), 240 ms.
        animationDuration: durations.navigation,
      },
      header,
      authHeader: (title) => ({ ...header(title), contentStyle: { backgroundColor: c.card } }),
      backOnly: {
        ...header(''),
        headerShown: Platform.OS === 'ios',
        headerTransparent: true,
        headerShadowVisible: false,
        headerStyle: undefined,
      },
    };
    // `scheme` keys the memo; `c` is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheme]);
}
