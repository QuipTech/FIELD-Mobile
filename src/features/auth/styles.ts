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
  registerScroll: { flexGrow: 1, gap: spacing.sm, padding: spacing.md },
  nameRow: { flexDirection: 'row', gap: 10 },
  nameField: { flex: 1 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    minHeight: layout.minTapTarget,
    paddingTop: spacing.xs,
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

  // Decorative shapes (rotation is animated in Decorations.tsx; positions in shapePlacements).
  shapeOutline: {
    position: 'absolute',
    width: 46,
    height: 46,
    borderWidth: 1.5,
    borderColor: colors.brandTintStrong,
    borderRadius: 10,
  },
  shapeDot: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.amberTint,
    opacity: 0.8,
  },
  shapeTile: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: colors.brandTint,
  },
});

/**
 * Where the decorative shapes sit on each screen. Sign in follows the M1 design; the others keep
 * them in each screen's open space so form controls never hide them. Two-factor (M1f) reuses
 * `register`, as both have their form at the top.
 */
export const shapePlacements = {
  signIn: {
    outline: { top: 26, right: 34 },
    dot: { top: 78, left: 26 },
    tile: { bottom: 150, right: 20 },
  },
  register: {
    outline: { bottom: 120, left: 30 },
    dot: { bottom: 200, right: 56 },
    tile: { bottom: 48, right: 26 },
  },
  // M1c–M1e: either side of the header, plus the open middle between header and form.
  step: {
    outline: { top: 30, right: 34 },
    dot: { top: 96, left: 28 },
    tile: { top: '42%', right: 40 },
  },
} as const;
