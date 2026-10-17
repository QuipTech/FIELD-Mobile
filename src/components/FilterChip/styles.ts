import { StyleSheet } from 'react-native';

import { colors, fontFamily, layout, spacing } from '@/theme';

export const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    minHeight: 32,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: colors.control,
    backgroundColor: colors.surface,
  },
  chipOn: { borderColor: colors.brandTintStrong, backgroundColor: colors.brandTint },
  chipLabel: { fontFamily: fontFamily.medium },
  pressed: { opacity: 0.7 },

  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.guideScrim },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.xs,
  },
  sheetTitle: {
    fontFamily: fontFamily.medium,
    fontSize: 16,
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  option: {
    minHeight: layout.minTapTarget + 4,
    paddingHorizontal: spacing.sm,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionPressed: { backgroundColor: colors.canvas },
});
