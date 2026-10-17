import type { NativeStackNavigationOptions } from 'expo-router';

import { colors, fontFamily } from './tokens';

/** Shared header styling for every Stack in the app. */
export const stackScreenOptions: NativeStackNavigationOptions = {
  headerStyle: { backgroundColor: colors.ground },
  headerShadowVisible: false,
  headerTintColor: colors.ink,
  headerTitleStyle: { fontFamily: fontFamily.bold, fontSize: 17, color: colors.ink },
  headerBackButtonDisplayMode: 'minimal',
  contentStyle: { backgroundColor: colors.ground },
};

/** White, left-aligned header with a hairline, from the M1b+ auth designs. */
export const authHeaderOptions = (title: string): NativeStackNavigationOptions => ({
  title,
  headerTitleAlign: 'left',
  headerShadowVisible: true,
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { fontFamily: fontFamily.medium, fontSize: 16, color: colors.ink },
  contentStyle: { backgroundColor: colors.surface },
});

/** The same white header for signed-in screens pushed over the tabs, on the app canvas. */
export const detailHeaderOptions = (title: string): NativeStackNavigationOptions => ({
  ...authHeaderOptions(title),
  contentStyle: { backgroundColor: colors.canvas },
});
