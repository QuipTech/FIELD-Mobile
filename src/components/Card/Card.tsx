import type { ReactNode } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { styles } from './styles';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Required when `onPress` is set. */
  accessibilityLabel?: string;
  /** Red top rule for emphasis (e.g. overdue SLA). */
  emphasis?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

/** White panel with a 2px top rule. Pressable when `onPress` is given. */
export function Card({
  children,
  onPress,
  accessibilityLabel,
  emphasis,
  style,
  testID,
}: CardProps) {
  const base = [styles.card, emphasis && styles.accent, style];
  if (!onPress) {
    return (
      <View style={base} testID={testID}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [base, pressed && styles.pressed]}
    >
      {children}
    </Pressable>
  );
}
