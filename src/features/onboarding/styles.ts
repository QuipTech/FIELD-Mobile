import { StyleSheet } from 'react-native';

import { colors, fontFamily, layout, onboarding, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.xs,
  },
  skip: {
    minWidth: layout.minTapTarget,
    minHeight: layout.minTapTarget,
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pager: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    paddingHorizontal: 28,
  },
  image: {
    width: onboarding.imageSize,
    height: onboarding.imageSize,
    borderRadius: onboarding.imageRadius,
  },
  copy: {
    alignItems: 'center',
    gap: spacing.xs,
    maxWidth: onboarding.textMaxWidth + 56,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 0,
    textAlign: 'center',
  },
  body: { textAlign: 'center', maxWidth: onboarding.textMaxWidth },
  dots: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  dot: {
    width: onboarding.dot,
    height: onboarding.dot,
    borderRadius: onboarding.dot / 2,
    backgroundColor: colors.dotIdle,
  },
  dotActive: {
    width: onboarding.dotActiveWidth,
    borderRadius: 4,
    backgroundColor: colors.brand,
  },
  footer: { paddingHorizontal: 28, paddingBottom: 28 },
});
