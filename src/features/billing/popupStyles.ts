import { StyleSheet } from 'react-native';

import { colors, elevation, fontFamily, scrimOpacity, spacing } from '@/theme';

/** The Payment required popup: a card floating over the dimmed app. */
export const popupStyles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: `rgba(20, 14, 52, ${scrimOpacity + 0.15})` },
  center: { flex: 1, justifyContent: 'center', padding: 20 },
  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    borderRadius: 24,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...elevation.fab,
  },
  content: { alignItems: 'center', gap: spacing.sm, padding: 24 },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.brandTint,
    borderWidth: 1,
    borderColor: colors.brandTintStrong,
    marginBottom: spacing.xxs,
  },
  title: {
    fontFamily: fontFamily.medium,
    fontSize: 22,
    lineHeight: 28,
    textAlign: 'center',
    marginTop: spacing.xxs,
  },
  lead: { textAlign: 'center' },
  price: {
    alignSelf: 'stretch',
    alignItems: 'center',
    gap: 2,
    paddingVertical: spacing.md,
    marginVertical: spacing.xxs,
    borderRadius: 16,
    backgroundColor: colors.brandTint,
  },
  amount: { fontFamily: fontFamily.medium, fontSize: 36, lineHeight: 42, color: colors.brandDeep },
  actions: { alignSelf: 'stretch', gap: spacing.xs },
  centered: { textAlign: 'center' },
  secure: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.xxs },
  signOut: { textDecorationLine: 'underline', paddingVertical: spacing.xxs },
  footerLinks: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
});
