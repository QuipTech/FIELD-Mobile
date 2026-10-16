import { StyleSheet } from 'react-native';

import { borders, colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  rule: { width: 32, height: borders.strong, backgroundColor: colors.line },
  action: { marginTop: spacing.xs },
});
