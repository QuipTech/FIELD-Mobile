import { StyleSheet } from 'react-native';

import { borders, colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderTopWidth: borders.strong,
    borderTopColor: colors.line,
    borderRadius: radius,
    padding: spacing.md,
    gap: spacing.xs,
  },
  accent: { borderTopColor: colors.accent },
  pressed: { backgroundColor: colors.neutralBg },
});
