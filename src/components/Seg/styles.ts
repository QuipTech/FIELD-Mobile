import { StyleSheet } from 'react-native';

import { borders, colors, layout, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: borders.strong,
    borderColor: colors.line,
    borderRadius: radius,
  },
  item: {
    flex: 1,
    minHeight: layout.minTapTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  divider: { borderLeftWidth: borders.strong, borderLeftColor: colors.line },
  selected: { backgroundColor: colors.ink },
  pressed: { backgroundColor: colors.neutralBg },
});
