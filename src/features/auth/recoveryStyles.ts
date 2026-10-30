import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, layout, spacing } from '@/theme';

/** Styles for the M1c–M1f recovery and two-factor screens. */
export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: { flexGrow: 1, paddingHorizontal: 28 },
  header: { alignItems: 'center', gap: spacing.md, paddingTop: 40 },
  tile: {
    width: 48,
    height: 48,
    borderRadius: brandControl.radius,
    backgroundColor: colors.brandTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headings: { alignItems: 'center', gap: spacing.xxs },
  title: { fontFamily: fontFamily.medium, fontSize: 22, lineHeight: 28, textAlign: 'center' },
  centered: { textAlign: 'center' },
  spacer: { flex: 1, minHeight: spacing.xl },
  form: { gap: spacing.md, paddingBottom: 28 },
  formTop: { marginTop: spacing.xl },
  footer: { paddingHorizontal: 28, paddingTop: spacing.sm, gap: spacing.md },
  linkRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 4 },
  link: { minHeight: layout.minTapTarget, justifyContent: 'center' },

  // CodeInput
  codeWrap: { gap: spacing.xxs },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: 7 },
  codeBox: {
    flex: 1,
    maxWidth: 48,
    height: brandControl.height,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Design: brand border plus a 2px tint ring around the focused box.
  codeBoxActive: { borderColor: colors.brand, outlineColor: colors.brandTint, outlineWidth: 2 },
  codeBoxError: { borderColor: colors.accentText },
  codeDigit: { fontFamily: fontFamily.medium, fontSize: 20, lineHeight: 24 },
  codeHidden: { ...StyleSheet.absoluteFill, opacity: 0.01, color: 'transparent' },

  // Two-factor (M1f)
  mfaScroll: { flexGrow: 1, gap: spacing.sm, padding: spacing.md },
  options: { gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    backgroundColor: colors.surface,
  },
  optionOn: { borderColor: colors.brand, outlineColor: colors.brandTint, outlineWidth: 2 },
  optionIcon: {
    width: 34,
    height: 34,
    borderRadius: brandControl.radius,
    backgroundColor: colors.canvas,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconOn: { backgroundColor: colors.brandTint },
  optionText: { flex: 1, gap: 2 },
  optionTitle: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20 },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: colors.brand },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.brand },
});
