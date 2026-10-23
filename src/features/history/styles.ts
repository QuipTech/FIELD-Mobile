import { StyleSheet } from 'react-native';

import { fontFamily, makeStyles, spacing } from '@/theme';

export const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  list: { marginTop: -spacing.xxs },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  question: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22 },
});

/** My history (themed). */
export const useStyles = makeStyles((c) => ({
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 20,
    overflow: 'hidden',
  },
  summaryBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Frosted white behind the badge icon.
  summaryBadgeFill: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    backgroundColor: c.onButton,
    opacity: 0.16,
  },
  summaryText: { flex: 1, gap: 2 },
  noMatch: { textAlign: 'center', paddingVertical: spacing.lg },
  group: { gap: spacing.xs },
  groupTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
    color: c.faint,
    marginLeft: spacing.xxs,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    overflow: 'hidden',
    shadowColor: c.primaryStrong,
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  divider: { height: StyleSheet.hairlineWidth, backgroundColor: c.border, marginLeft: 68 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
  },
  pressed: { backgroundColor: c.fill },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.primaryTint,
  },
  iconTileAi: { backgroundColor: c.primaryTintStrong },
  rowText: { flex: 1, gap: 3 },
  question: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 21, color: c.ink },
  clear: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
}));
