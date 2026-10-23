import { borders, layout, makeStyles, radii, spacing, typeScale } from '@/theme';

export const useStyles = makeStyles((c) => ({
  wrapper: { gap: 6 },
  field: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.snug,
    backgroundColor: c.card,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    borderRadius: radii.control,
  },
  focused: { borderColor: c.primary },
  error: { borderColor: c.danger },
  disabled: { backgroundColor: c.fill, borderColor: c.border },
  input: {
    ...typeScale.body,
    flex: 1,
    alignSelf: 'stretch',
    color: c.ink,
    paddingVertical: spacing.sm,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  // OtpInput
  otpRow: { flexDirection: 'row', gap: spacing.xs },
  otpBox: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.card,
    borderWidth: borders.control,
    borderColor: c.borderStrong,
    borderRadius: radii.control,
  },
  otpActive: {
    borderColor: c.primary,
    // The design's 3 px tint ring around the active box.
    outlineColor: c.primaryTint,
    outlineWidth: 3,
    outlineStyle: 'solid',
  },
  otpHidden: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, opacity: 0.011 },
}));
