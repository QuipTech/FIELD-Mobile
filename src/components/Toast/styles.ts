import { StyleSheet } from 'react-native';

import { colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingLeft: spacing.md,
    paddingRight: spacing.xxs,
    backgroundColor: colors.ink,
    borderLeftWidth: 6,
    borderRadius: radius,
  },
  neutral: { borderLeftColor: colors.ink },
  success: { borderLeftColor: colors.successBg },
  error: { borderLeftColor: colors.accent },
  message: { flex: 1 },
});
