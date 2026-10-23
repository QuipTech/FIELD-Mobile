import { borders, layout, makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((c) => ({
  base: {
    minHeight: layout.buttonHeight,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radii.control,
    borderWidth: borders.control,
  },
  small: {
    minHeight: layout.smallButtonHeight,
    paddingHorizontal: spacing.snug,
    borderRadius: radii.small,
  },
  fullWidth: { alignSelf: 'stretch' },
  primary: { backgroundColor: c.button, borderColor: c.button },
  primaryPressed: { backgroundColor: c.buttonPressed, borderColor: c.buttonPressed },
  secondary: { backgroundColor: c.card, borderColor: c.borderStrong },
  secondaryPressed: { backgroundColor: c.fill },
  ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
  ghostPressed: { backgroundColor: c.fill },
  danger: { backgroundColor: c.card, borderColor: c.borderStrong },
  dangerPressed: { backgroundColor: c.dangerTint },
  disabled: { backgroundColor: c.fill, borderColor: c.fill },
  icon: {
    width: layout.minTapTarget,
    height: layout.minTapTarget,
    borderRadius: radii.control,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPressed: { backgroundColor: c.fill },
  badgeLayer: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
  label: { flexShrink: 1, textAlign: 'center' },
}));
