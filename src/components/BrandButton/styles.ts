import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    minHeight: brandControl.height,
    borderRadius: brandControl.radius,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primary: { backgroundColor: colors.brand, borderColor: colors.brand },
  primaryPressed: { backgroundColor: colors.brandDeep, borderColor: colors.brandDeep },
  outline: {
    minHeight: brandControl.secondaryHeight,
    backgroundColor: colors.surface,
    borderColor: colors.control,
  },
  outlinePressed: { backgroundColor: colors.canvas },
  disabled: { opacity: 0.6 },
  label: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 20 },
});
