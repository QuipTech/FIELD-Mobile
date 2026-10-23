import { StyleSheet } from 'react-native';

import { colors, elevation, fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: 14 },

  // Profile
  profile: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: spacing.xxs },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.brandTint,
    borderWidth: 1,
    borderColor: colors.brandTintStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.medium, fontSize: 20, color: colors.brandDeep },
  profileText: { flex: 1, gap: 2, alignItems: 'flex-start' },
  name: { fontFamily: fontFamily.medium, fontSize: 19, lineHeight: 24 },
  rolePill: { marginTop: spacing.xxs },

  // Cards
  card: {
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
    ...elevation.card,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  cardText: { flex: 1, gap: 2 },
  cardTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
  planTitle: { fontFamily: fontFamily.medium, fontSize: 18, lineHeight: 24, flexShrink: 1 },
  planDate: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  baselineRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  hairline: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xxs },
  compactButton: { minHeight: 40, paddingHorizontal: 14 },

  // Section headings
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
    marginLeft: spacing.xxs,
  },
  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22, marginTop: 6 },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.fill,
  },
  iconBoxLarge: { width: 42, height: 42, borderRadius: 10 },
  iconButton: {
    width: 44,
    height: 44,
    marginRight: -spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonPressed: { opacity: 0.5 },

  // Allowance meter
  meterTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.fill,
    overflow: 'hidden',
    marginVertical: spacing.xxs,
  },
  meterFill: { height: '100%', borderRadius: 4, backgroundColor: colors.brand },
  meterOver: { backgroundColor: colors.amber },

  footnote: { textAlign: 'center', marginTop: spacing.xs },
});
