import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing, typeScale } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  headerBar: {
    height: 52,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: fontFamily.medium, fontSize: 17 },
  step: { paddingRight: spacing.sm },
  progress: { flexDirection: 'row', gap: 6, paddingHorizontal: spacing.md, paddingBottom: 10 },
  progressBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: colors.fill },
  progressOn: { backgroundColor: colors.brand },

  content: { padding: spacing.md, gap: spacing.sm },
  footer: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
  label: {
    fontFamily: fontFamily.medium,
    fontSize: 12,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: colors.inkMuted,
    marginTop: spacing.xs,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  input: {
    ...typeScale.body,
    color: colors.ink,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.control,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 14,
  },
  inputFocused: { borderColor: colors.brand },
  notes: { minHeight: 120, textAlignVertical: 'top' },
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  hoursInput: { flex: 1 },
  summary: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  summaryTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
});
