import { StyleSheet } from 'react-native';

import { borders, colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  block: { backgroundColor: colors.skeleton, borderRadius: radius },
  row: {
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.lineSoft,
  },
});
