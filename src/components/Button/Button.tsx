import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';
import { Text, type TextColor } from '../Text/Text';
import { styles } from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';

type CommonProps = {
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export type ButtonProps = CommonProps & {
  label: string;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  fullWidth?: boolean;
  accessibilityHint?: string;
};

const LABEL_COLOR: Record<ButtonVariant, TextColor> = {
  primary: 'onAccent',
  secondary: 'ink',
  ghost: 'ink',
};

export function Button(props: ButtonProps) {
  const { label, onPress, variant = 'primary', icon: Icon, loading, disabled, fullWidth } = props;
  const inactive = disabled || loading;
  const labelColor: TextColor = disabled ? 'inkSubtle' : LABEL_COLOR[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={props.accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={props.testID}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        disabled && styles.disabled,
        fullWidth && styles.fullWidth,
        props.style,
      ]}
    >
      <Text variant="bodyStrong" color={labelColor} style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      {loading ? (
        <ActivityIndicator color={colors[labelColor]} />
      ) : (
        Icon && <Icon size={20} color={colors[labelColor]} strokeWidth={2} />
      )}
    </Pressable>
  );
}
