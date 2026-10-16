import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type StyleProp, type TextInputProps, type ViewStyle } from 'react-native';

import { Text } from '@/components/Text/Text';
import { colors, layout } from '@/theme';
import { styles } from './styles';

export type AuthFieldProps = Omit<TextInputProps, 'style' | 'placeholder'> & {
  /** Placeholder and accessible name (the design has no visible label). */
  label: string;
  icon?: LucideIcon;
  error?: string;
  accessory?: ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<TextInput>;
};

/** Rounded, optionally icon-led text field from the M1 sign-in designs. */
export function AuthField({
  label,
  icon: Icon,
  error,
  accessory,
  containerStyle,
  ref,
  ...rest
}: AuthFieldProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.fieldWrap, containerStyle]}>
      <View style={[styles.field, focused && styles.fieldFocused, !!error && styles.fieldError]}>
        {Icon && <Icon size={20} color={colors.inkSubtle} strokeWidth={2} />}
        <TextInput
          ref={ref}
          placeholder={label}
          accessibilityLabel={label}
          aria-invalid={!!error}
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.brand}
          maxFontSizeMultiplier={layout.maxFontScale}
          style={styles.fieldInput}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
        />
        {accessory}
      </View>
      {error && (
        <Text variant="caption" color="accentText" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
