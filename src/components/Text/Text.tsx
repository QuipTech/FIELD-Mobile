import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { colors, layout, typeScale, type TypeVariant } from '@/theme';

export type TextColor = keyof typeof colors;

export type TextProps = RNTextProps & {
  variant?: TypeVariant;
  color?: TextColor;
};

/** All app text goes through this — applies Archivo, the type scale and font-scale cap. */
export function Text({ variant = 'body', color = 'ink', style, ...rest }: TextProps) {
  return (
    <RNText
      maxFontSizeMultiplier={layout.maxFontScale}
      style={[typeScale[variant], { color: colors[color] }, style]}
      {...rest}
    />
  );
}
