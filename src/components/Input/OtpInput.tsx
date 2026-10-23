import { useRef, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { layout } from '@/theme';
import { Text } from '../Text/Text';
import { useStyles } from './styles';

export type OtpInputProps = {
  value: string;
  onChange: (code: string) => void;
  /** Called once all digits are entered (typed, pasted or autofilled). */
  onComplete?: (code: string) => void;
  length?: number;
  error?: string;
  autoFocus?: boolean;
  accessibilityLabel?: string;
};

/**
 * Six code boxes (`.otp`) backed by one hidden field, so paste, iOS "From Messages" and
 * Android SMS autofill fill every box at once and backspace moves back naturally.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  ...props
}: OtpInputProps) {
  const styles = useStyles();
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(false);
  const active = Math.min(value.length, length - 1);

  function handleChange(text: string) {
    const code = text.replace(/\D/g, '').slice(0, length);
    onChange(code);
    if (code.length === length) onComplete?.(code);
  }

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={() => input.current?.focus()} accessible={false} style={styles.otpRow}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[
              styles.otpBox,
              focused && i === active && styles.otpActive,
              !!error && styles.error,
            ]}
          >
            <Text variant="sheetTitle">{value[i] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          ref={input}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoFocus={props.autoFocus}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={length}
          caretHidden
          maxFontSizeMultiplier={layout.maxFontScale}
          accessibilityLabel={props.accessibilityLabel ?? `${length}-digit code`}
          accessibilityHint={error}
          aria-invalid={!!error}
          style={styles.otpHidden}
        />
      </Pressable>
      {error && (
        <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      )}
    </View>
  );
}
