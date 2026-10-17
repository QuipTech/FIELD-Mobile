import { StyleSheet } from 'react-native';

import { brandControl, colors, elevation, fontFamily, spacing } from '@/theme';

export const styles = StyleSheet.create({
  // Ask AI / Contact support tiles
  tiles: { flexDirection: 'row', gap: spacing.sm },
  tile: {
    flex: 1,
    height: 84,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: brandControl.radius,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    justifyContent: 'center',
    gap: spacing.xs,
    ...elevation.card,
  },
  tilePrimary: { backgroundColor: colors.brand, borderColor: colors.brand },
  pressed: { opacity: 0.85 },
  tileLabel: { fontFamily: fontFamily.medium, fontSize: 15, lineHeight: 20 },

  sectionTitle: { fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 22, marginTop: 6 },

  // Article
  articleTitle: { fontFamily: fontFamily.medium, fontSize: 22, lineHeight: 28 },
  paragraph: { lineHeight: 24 },
  tip: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.brandTintStrong,
    backgroundColor: colors.brandTint,
  },
  tipText: { flex: 1, lineHeight: 22 },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xxs,
  },
  thanks: { textAlign: 'center' },
});
