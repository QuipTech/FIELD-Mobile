import { StyleSheet } from 'react-native';

import { borders, colors, layout, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // label flush-left, icon pushed right
    gap: spacing.sm,
    borderRadius: radius,
    borderWidth: borders.strong,
  },
  fullWidth: { alignSelf: 'stretch' },
  primary: { backgroundColor: colors.accent, borderColor: colors.accent },
  primaryPressed: { backgroundColor: colors.accentPressed, borderColor: colors.accentPressed },
  secondary: { backgroundColor: 'transparent', borderColor: colors.line },
  secondaryPressed: { backgroundColor: colors.neutralBg },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 0 },
  ghostPressed: { opacity: 0.6 },
  icon: {
    width: layout.minTapTarget,
    minHeight: layout.minTapTarget,
    paddingHorizontal: 0,
    justifyContent: 'center',
    borderColor: 'transparent',
  },
  iconPressed: { backgroundColor: colors.neutralBg },
  disabled: { backgroundColor: colors.neutralBg, borderColor: colors.neutralBg },
  label: { flexShrink: 1 },
});
