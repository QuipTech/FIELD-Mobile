import { StyleSheet } from 'react-native';

import { colors, fontFamily } from '@/theme';

export const styles = StyleSheet.create({
  // Canvas behind the bar's rounded corners.
  backdrop: { backgroundColor: colors.canvas },
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingHorizontal: 10,
    paddingTop: 10,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#1E2024',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52, justifyContent: 'flex-end' },
  // Active tab: the icon sits in a soft violet pill.
  iconWrap: { width: 56, height: 32, alignItems: 'center', justifyContent: 'center' },
  indicator: {
    ...StyleSheet.absoluteFill,
    borderRadius: 16,
    backgroundColor: colors.brandTint,
  },
  label: { fontFamily: fontFamily.regular, fontSize: 12, color: colors.inkSubtle },
  labelOn: { fontFamily: fontFamily.medium, color: colors.brandDeep },
});
