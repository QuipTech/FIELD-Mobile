import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: radius,
  },
  neutral: { backgroundColor: colors.neutralBg },
  accent: { backgroundColor: colors.accentBg },
  success: { backgroundColor: colors.successBg },
  warning: { backgroundColor: colors.warningBg },
  info: { backgroundColor: colors.infoBg },
  ink: { backgroundColor: colors.ink },
  solidAccent: { backgroundColor: colors.accent },
  dot: { width: 6, height: 6 },
});
