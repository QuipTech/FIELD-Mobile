import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, elevation, spacing } from '@/theme';

export type BrandCardProps = {
  children: ReactNode;
  onPress?: () => void;
  /** Required when `onPress` is set; screen readers read it instead of the children. */
  accessibilityLabel?: string;
  /** Violet outline, e.g. the chosen plan. */
  highlighted?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** White rounded card with a hairline and soft lift (M2+ designs). Pressable with `onPress`. */
export function BrandCard({
  children,
  onPress,
  accessibilityLabel,
  highlighted,
  style,
}: BrandCardProps) {
  const base = [styles.card, highlighted && styles.highlighted, style];
  if (!onPress) return <View style={base}>{children}</View>;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [base, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
    ...elevation.card,
  },
  highlighted: { borderColor: colors.brand },
  pressed: { backgroundColor: colors.canvas },
});
