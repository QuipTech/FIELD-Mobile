import { StyleSheet } from 'react-native';

import { colors, fontFamily } from '@/theme';

const FAB = 54;

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
  fabLabel: { marginTop: FAB - 24 + 4 },
  fab: {
    position: 'absolute',
    top: -24 - 10,
    width: FAB,
    height: FAB,
    borderRadius: FAB / 2,
    backgroundColor: colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.meshViolet,
    shadowOpacity: 0.5,
    shadowRadius: 11,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  // Soft halo behind the button; pulses with the float.
  fabGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: FAB + 16,
    height: FAB + 16,
    borderRadius: (FAB + 16) / 2,
    backgroundColor: colors.brandGlowViolet,
  },
  // Clipped gradient + white ring; separate from `fab` so iOS keeps the drop shadow.
  fabClip: {
    ...StyleSheet.absoluteFill,
    borderRadius: FAB / 2,
    borderWidth: 4,
    borderColor: colors.surface,
    overflow: 'hidden',
  },
});
