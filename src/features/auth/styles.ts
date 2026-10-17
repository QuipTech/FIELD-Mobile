import { StyleSheet } from 'react-native';

import { brandControl, colors, layout, spacing, typeScale } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 28,
  },
  logo: { height: 44, width: 88 },
  tagline: { textAlign: 'center' },
  form: { alignSelf: 'stretch', gap: 14, marginTop: spacing.xs },
  orRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  links: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  link: { minHeight: layout.minTapTarget, justifyContent: 'center' },

  // Register (M1b)
  // Same 28pt gutter and 14pt rhythm as Sign in; centred in the space below the header.
  registerScroll: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 28,
    paddingTop: spacing.lg,
  },
  nameRow: { flexDirection: 'row', gap: 14 },
  nameField: { flex: 1 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: layout.minTapTarget,
  },
  checkbox: {
    width: 18,
    height: 18,
    marginTop: 1,
    borderWidth: 1.5,
    borderColor: colors.control,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.brand, borderColor: colors.brand },
  checkLabel: { flex: 1 },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxs,
  },

  // AuthField
  fieldWrap: { gap: spacing.xxs },
  field: {
    minHeight: brandControl.height,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldFocused: { borderColor: colors.brand },
  fieldError: { borderColor: colors.accentText },
  fieldInput: { ...typeScale.body, flex: 1, color: colors.ink, paddingVertical: spacing.sm },
  reveal: {
    minWidth: layout.minTapTarget,
    minHeight: layout.minTapTarget,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -spacing.xs,
  },
});
