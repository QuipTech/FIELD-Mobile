import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing } from '@/theme';

const cardShadow = {
  shadowColor: '#23211E',
  shadowOpacity: 0.06,
  shadowRadius: 3,
  shadowOffset: { width: 0, height: 1 },
  elevation: 1,
} as const;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: 14 },

  // Header (white bar)
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    overflow: 'hidden',
  },
  headerShape: {
    position: 'absolute',
    top: -16,
    right: 70,
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.brandTint,
    transform: [{ rotate: '20deg' }],
  },
  headerText: { flex: 1, gap: 1 },
  headerTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: brandControl.radius,
    backgroundColor: colors.amberTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.medium, fontSize: 13, color: colors.brandDeep },

  // Search
  search: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },

  // Quick action tiles
  row: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    height: 88,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: spacing.xs,
    ...cardShadow,
  },
  tilePressed: { opacity: 0.85 },
  tileLabel: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20, color: colors.ink },

  // Cards
  card: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 14,
    gap: spacing.xs,
    ...cardShadow,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardText: { flex: 1, gap: 2 },
  itemTitle: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20 },
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  baselineRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22 },
  iconBox: {
    width: 34,
    height: 34,
    borderRadius: brandControl.radius,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
  },
  plan: { marginRight: 2 },

  // Admin KPI tiles (2×2)
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  kpi: { flexBasis: '47%', flexGrow: 1, minHeight: 72, gap: 2 },
  kpiValue: { fontFamily: fontFamily.medium, fontSize: 28, lineHeight: 32 },

  tag: { borderWidth: 1, borderRadius: 6, paddingHorizontal: spacing.xs, paddingVertical: 3 },
  sampleNote: { textAlign: 'center' },
});
