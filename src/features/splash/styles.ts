import { StyleSheet } from 'react-native';

import { colors, spacing, splash } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.brandSplash,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blobViolet: { position: 'absolute', top: -130, left: -140 },
  blobTeal: { position: 'absolute', bottom: -160, right: -160 },
  // Card sits at the exact screen centre so it lines up with the native splash image.
  card: {
    backgroundColor: colors.surface,
    borderRadius: splash.cardRadius,
    paddingHorizontal: splash.cardPaddingX,
    paddingVertical: splash.cardPaddingY,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  logo: { width: splash.logoWidth, height: splash.logoHeight },
  tagline: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.md,
    textAlign: 'center',
  },
});
