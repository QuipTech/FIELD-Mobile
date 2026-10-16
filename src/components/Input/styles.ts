import { StyleSheet } from 'react-native';

import { borders, colors, layout, radius, spacing, typeScale } from '@/theme';

export const styles = StyleSheet.create({
  wrapper: { gap: spacing.xxs },
  field: {
    minHeight: layout.inputHeight,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: borders.strong,
    borderColor: colors.line,
    borderRadius: radius,
  },
  focused: { borderColor: colors.accent },
  error: { borderColor: colors.accentText },
  disabled: { backgroundColor: colors.neutralBg, borderColor: colors.lineSoft },
  input: {
    ...typeScale.body,
    flex: 1,
    color: colors.ink,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
  },
  multiline: { minHeight: 120, textAlignVertical: 'top' },
  accessory: { paddingRight: spacing.xxs },
});
