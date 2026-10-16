import { useState, type ReactNode, type Ref } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';

import { colors, layout } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type InputProps = Omit<TextInputProps, 'style'> & {
  label: string;
  error?: string;
  hint?: string;
  /** Right-side element, e.g. an IconButton to show/hide a password. */
  accessory?: ReactNode;
  ref?: Ref<TextInput>;
};

export function Input({
  label,
  error,
  hint,
  accessory,
  editable = true,
  ref,
  ...rest
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const message = error ?? hint;

  return (
    <View style={styles.wrapper}>
      <Text variant="label">{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.error,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          ref={ref}
          editable={editable}
          accessibilityLabel={label}
          accessibilityHint={message}
          aria-invalid={!!error}
          placeholderTextColor={colors.inkSubtle}
          selectionColor={colors.accent}
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
        {accessory && <View style={styles.accessory}>{accessory}</View>}
      </View>
      {message && (
        <Text
          variant="caption"
          color={error ? 'accentText' : 'inkMuted'}
          accessibilityLiveRegion="polite"
        >
          {message}
        </Text>
      )}
    </View>
  );
}
