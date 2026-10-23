import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { layout, typeScale, useTheme, type ThemeColors, type TypeVariant } from '@/theme';

/** Old colour names still used by un-migrated screens, mapped onto theme colours. */
const LEGACY_ALIAS = {
  inkMuted: 'muted',
  inkSubtle: 'faint',
  brand: 'primary',
  onAccent: 'onButton',
  onInk: 'onButton',
  accentText: 'danger',
  amber: 'warning',
  info: 'primaryStrong',
} as const satisfies Record<string, keyof ThemeColors>;

export type TextColor = keyof ThemeColors | keyof typeof LEGACY_ALIAS;

export type TextProps = RNTextProps & { variant?: TypeVariant; color?: TextColor };

/** All app text goes through this: IBM Plex Sans, the type scale, theme colour, font-scale cap. */
export function Text({ variant = 'body', color = 'ink', style, ...rest }: TextProps) {
  const { colors } = useTheme();
  const key = color in LEGACY_ALIAS ? LEGACY_ALIAS[color as keyof typeof LEGACY_ALIAS] : color;
  return (
    <RNText
      maxFontSizeMultiplier={layout.maxFontScale}
      style={[typeScale[variant], { color: colors[key as keyof ThemeColors] }, style]}
      {...rest}
    />
  );
}
