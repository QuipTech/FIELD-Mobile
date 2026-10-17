import { StyleSheet } from 'react-native';

import { colors, elevation, spacing } from '@/theme';

const RADIUS = 12;

export const styles = StyleSheet.create({
  // The outer view carries the shadow; the inner one clips pressed highlights to the corners.
  group: { borderRadius: RADIUS, backgroundColor: colors.surface, ...elevation.card },
  clip: { borderRadius: RADIUS, borderWidth: 1, borderColor: colors.divider, overflow: 'hidden' },
  row: {
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rowPressed: { backgroundColor: colors.canvas },
  label: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 14 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
