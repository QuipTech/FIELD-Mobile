import { StyleSheet } from 'react-native';

import { borders, colors, spacing } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: borders.hairline,
    borderBottomColor: colors.lineSoft,
  },
  pressed: { backgroundColor: colors.neutralBg },
  body: { flex: 1, gap: 2 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
