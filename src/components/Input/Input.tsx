import type { LucideIcon } from 'lucide-react-native';
import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { layout, useTheme } from '@/theme';
import { Text } from '../Text/Text';
import { useStyles } from './styles';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Leading icon inside the field (search, phone…). */
  icon?: LucideIcon;
  /** Right-side element, e.g. an IconButton to show/hide a password. */
  accessory?: ReactNode;
  ref?: Ref<TextInput>;
};

/** `.fld` / `.inp`: label above a 52 px field; brand outline on focus, red with a message on error. */
export function Input({
  label,
  error,
  hint,
  icon: Icon,
  accessory,
  editable = true,
  ref,
  ...rest
}: InputProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const message = error ?? hint;

  return (
    <View style={styles.wrapper}>
      <Text variant="label" color="muted">
        {label}
      </Text>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.error,
          !editable && styles.disabled,
        ]}
      >
        {Icon && <Icon size={layout.iconSize} color={colors.faint} strokeWidth={1.8} />}
        <TextInput
          ref={ref}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={message}
          aria-invalid={!!error}
          placeholderTextColor={colors.faint}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          maxFontSizeMultiplier={layout.maxFontScale}
          style={[styles.input, rest.multiline && styles.multiline]}
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
      {message && (
        <Text variant="caption" color={error ? 'danger' : 'muted'} accessibilityLiveRegion="polite">
          {message}
        </Text>
      )}
    </View>
  );
}
