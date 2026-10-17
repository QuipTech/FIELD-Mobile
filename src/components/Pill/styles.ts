import { StyleSheet } from 'react-native';

import { fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderWidth: 1,
    borderRadius: 7,
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
  },
  label: { fontFamily: fontFamily.medium, fontSize: 12, lineHeight: 16 },
});
