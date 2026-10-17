import { StyleSheet } from 'react-native';

import { colors, fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  list: { marginTop: -spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: 14,
  },
  rowDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  pressed: { opacity: 0.6 },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: { flex: 1, gap: 2 },
  title: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    marginTop: 7,
  },
  markAll: { minHeight: 44, justifyContent: 'center' },
  markAllText: { fontFamily: fontFamily.medium },

  // Detail
  head: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  headText: { flex: 1, gap: 1 },
  detailTitle: { fontFamily: fontFamily.medium, fontSize: 19, lineHeight: 24 },
  body: { lineHeight: 24 },
  actions: { flexDirection: 'row', gap: spacing.sm },
  action: { flex: 1 },
});
