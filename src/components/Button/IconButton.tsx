import type { LucideIcon } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme, type ThemeColors } from '@/theme';
import { PressableScale } from '../PressableScale/PressableScale';
import { useStyles } from './styles';

export type IconButtonProps = {
  icon: LucideIcon;
  /** Required: icon-only controls must be labelled for screen readers. */
  accessibilityLabel: string;
  onPress: () => void;
  color?: keyof ThemeColors;
  size?: number;
  disabled?: boolean;
  /** Small overlay, e.g. the unread dot on the bell. */
  badge?: ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** 48×48 icon-only button (`.ibtn`): big enough to hit with gloves. */
export function IconButton({ icon: Icon, color = 'ink', size = 22, ...props }: IconButtonProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <PressableScale
      onPress={props.onPress}
      disabled={props.disabled}
      accessibilityRole="button"
      accessibilityLabel={props.accessibilityLabel}
      accessibilityState={{ disabled: !!props.disabled }}
      testID={props.testID}
      containerStyle={props.style}
      style={({ pressed }) => [styles.icon, pressed && styles.iconPressed]}
    >
      <Icon size={size} color={colors[props.disabled ? 'faint' : color]} strokeWidth={1.8} />
      {props.badge && (
        <View pointerEvents="none" style={styles.badgeLayer}>
          {props.badge}
        </View>
      )}
    </PressableScale>
  );
}
