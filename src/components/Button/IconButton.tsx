import type { LucideIcon } from 'lucide-react-native';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { colors } from '@/theme';
import type { TextColor } from '../Text/Text';
import { styles } from './styles';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required — icon-only controls must be labelled for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  color?: TextColor;
  size?: number;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** 44×44 icon-only button (the `icon` variant). */
export function IconButton({ icon: Icon, color = 'ink', size = 22, ...props }: IconButtonProps) {
  return (
    <Pressable
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      accessibilityState={{ disabled: !!props.disabled }}
      hitSlop={4}
      testID={props.testID}
      style={({ pressed }) => [
        styles.base,
        styles.icon,
        pressed && styles.iconPressed,
        props.style,
      ]}
    >
      <Icon size={size} color={colors[props.disabled ? 'inkSubtle' : color]} strokeWidth={2} />
    </Pressable>
  );
}
