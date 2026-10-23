import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, type StyleProp, type ViewStyle } from 'react-native';

import { layout, useTheme, type ThemeColors } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { Text } from '../Text/Text';
import { useStyles } from './styles';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** 44 px instead of 52 — only beside other controls, never as the main action. */
  size?: 'default' | 'small';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

const LABEL: Record<ButtonVariant, keyof ThemeColors> = {
  primary: 'onButton',
  secondary: 'ink',
  ghost: 'primary',
  danger: 'danger',
};

/** `.btn` in the design. Primary buttons add a light haptic. */
export function Button(props: ButtonProps) {
  const {
    label,
    variant = 'primary',
    icon: Icon,
    iconPosition = 'left',
    loading,
    disabled,
  } = props;
  const styles = useStyles();
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const tone = disabled ? 'faint' : LABEL[variant];
  const icon = loading ? (
    <ActivityIndicator color={colors[tone]} />
  ) : (
    Icon && <Icon size={layout.iconSize} color={colors[tone]} strokeWidth={1.8} />
  );

  return (
    <PressableScale
      onPress={props.onPress}
      disabled={inactive}
      haptic={variant === 'primary'}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={props.accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      testID={props.testID}
      containerStyle={[props.fullWidth && styles.fullWidth, props.style]}
      style={({ pressed }) => [
        styles.base,
        props.size === 'small' && styles.small,
        styles[variant],
        pressed && styles[`${variant}Pressed`],
        disabled && styles.disabled,
      ]}
    >
      {iconPosition === 'left' && icon}
      <Text
        variant={props.size === 'small' ? 'row' : 'bodyStrong'}
        color={tone}
        style={styles.label}
        numberOfLines={2}
      >
        {label}
      </Text>
      {iconPosition === 'right' && icon}
    </PressableScale>
  );
}
