import { StyleSheet } from 'react-native';

import { colors, fontFamily, spacing } from '@/theme';

/** Billing-only additions to the shared Me styles (`@/features/me/styles`). */
export const billingStyles = StyleSheet.create({
  price: { fontFamily: fontFamily.medium, fontSize: 24, lineHeight: 30 },
  form: { gap: spacing.sm, marginTop: spacing.xxs },
  formCell: { gap: 6 },
  stateChips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  postcode: { width: 140 },
  actions: { gap: spacing.xs, marginTop: spacing.xxs },
  notice: {
    borderRadius: 12,
    padding: spacing.md,
    gap: spacing.xxs,
    backgroundColor: colors.amberTint,
  },
  noticeDanger: { backgroundColor: colors.dangerTint },
  nextTerm: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    borderRadius: 8,
    padding: spacing.sm,
    backgroundColor: colors.brandTint,
  },
  stats: { flexDirection: 'row', flexWrap: 'wrap', rowGap: spacing.sm },
  stat: { width: '50%', gap: 2 },
  statValue: { fontFamily: fontFamily.medium, fontSize: 17, lineHeight: 22 },
  sheetBody: { gap: spacing.sm },
});
