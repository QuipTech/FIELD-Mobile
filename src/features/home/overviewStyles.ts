import { StyleSheet } from 'react-native';

import { colors, fontFamily, spacing } from '@/theme';

/** Admin Overview cards on Home. */
export const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minWidth: 0,
    gap: 8,
    padding: 14,
    minHeight: 144,
    borderRadius: 20,
    overflow: 'hidden',
    shadowOpacity: 0,
    elevation: 0,
  },
  statAccent: {
    position: 'absolute',
    top: -24,
    right: -22,
    width: 76,
    height: 76,
    borderRadius: 38,
    opacity: 0.55,
  },
  statLabel: { fontSize: 12, lineHeight: 17, minHeight: 34 },
  statIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { fontFamily: fontFamily.semibold, fontSize: 28, lineHeight: 32, color: colors.ink },
  list: { paddingVertical: 4, gap: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: 10 },
  rowDivider: { borderBottomWidth: 1, borderBottomColor: colors.divider },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { textAlign: 'center', paddingVertical: spacing.md },
});
