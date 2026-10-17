import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing, typeScale } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: spacing.md, gap: spacing.sm },
  filters: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.xxs },
  newButton: { minHeight: 38, paddingHorizontal: 14, gap: 6 },

  // List card
  splitRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21, marginTop: 2 },
  footnote: { textAlign: 'center', marginTop: spacing.xs },

  // Detail
  machineRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  machineText: { flex: 1, gap: 1 },
  machineName: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  caseTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22, marginTop: spacing.xs },
  paragraph: { lineHeight: 24 },
  attachments: { flexDirection: 'row', gap: spacing.xs },
  attachment: {
    width: 76,
    height: 56,
    borderRadius: brandControl.radius,
    borderWidth: 1,
    borderColor: colors.control,
    backgroundColor: colors.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { opacity: 0.7 },
  hairline: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.xxs },
  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22 },
  activity: { gap: spacing.xxs, paddingVertical: spacing.xs },
  activityDivider: { borderTopWidth: 1, borderTopColor: colors.divider },
  activityHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.brandDeep },
  author: { flex: 1, fontFamily: fontFamily.medium, fontSize: 15 },

  // Reply composer
  replyInput: {
    ...typeScale.body,
    color: colors.ink,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingTop: 13,
    paddingBottom: 13,
  },
  replyFocused: { borderColor: colors.brand },
});
