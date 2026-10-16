import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type BrandButtonVariant = 'primary' | 'outline';

export type BrandButtonProps = {
  label: string;
  onPress: () => void;
  variant?: BrandButtonVariant;
  /** Leading icon, rendered before the centred label. */
  icon?: ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/**
 * Violet, rounded, centred button from the M0.5+ designs (onboarding, sign in).
 * The flat red `Button` remains for the rest of the design system.
 */
export function BrandButton(props: BrandButtonProps) {
  const { label, onPress, variant = 'primary', icon, loading, disabled } = props;
  const inactive = disabled || loading;
  const labelColor = variant === 'primary' ? 'onAccent' : 'ink';

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={props.testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        inactive && styles.disabled,
        props.style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors[labelColor]} /> : icon}
      <Text color={labelColor} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}
