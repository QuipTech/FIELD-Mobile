import { StyleSheet } from 'react-native';

import { borders, colors, elevation, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: colors.scrim },
  panel: {
    maxHeight: '90%',
    backgroundColor: colors.ground,
    borderTopWidth: borders.strong,
    borderTopColor: colors.line,
    borderRadius: radius,
    ...elevation.sheet,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: spacing.md,
    paddingRight: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  title: { flex: 1 },
  body: { paddingHorizontal: spacing.md, paddingBottom: spacing.md, gap: spacing.md },
});
