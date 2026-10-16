import { useRef, useState } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { styles } from './recoveryStyles';

export type CodeInputProps = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: string;
  /** Called once every digit is filled (typed, pasted or autofilled from SMS/email). */
  onComplete?: (code: string) => void;
};

/**
 * One-time-code boxes backed by a single hidden TextInput, so paste and
 * iOS/Android code autofill work and backspace behaves naturally.
 */
export function CodeInput({ value, onChange, length = 6, error, onComplete }: CodeInputProps) {
  const input = useRef<TextInput>(null);
  const [focused, setFocused] = useState(true);
  const activeIndex = Math.min(value.length, length - 1);

  const handleChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, length);
    onChange(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <View style={styles.codeWrap}>
      <Pressable style={styles.codeRow} onPress={() => input.current?.focus()} accessible={false}>
        {Array.from({ length }, (_, i) => (
          <View
            key={i}
            style={[
              styles.codeBox,
              focused && i === activeIndex && styles.codeBoxActive,
              !!error && styles.codeBoxError,
            ]}
          >
            <Text style={styles.codeDigit}>{value[i] ?? ''}</Text>
          </View>
        ))}
        <TextInput
          ref={input}
          value={value}
          onChangeText={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          maxLength={length}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
          autoFocus
          caretHidden
          accessibilityLabel={`${length}-digit verification code`}
          aria-invalid={!!error}
          style={styles.codeHidden}
        />
      </Pressable>
      {error && (
        <Text
          variant="caption"
          color="accentText"
          style={styles.centered}
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
}
