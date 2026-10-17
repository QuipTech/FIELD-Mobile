import { StyleSheet } from 'react-native';

import { brandControl, colors, fontFamily, spacing, typeScale } from '@/theme';

const SHUTTER = 68;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.camera },
  topBar: {
    height: 52,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  topTitle: { fontFamily: fontFamily.medium, fontSize: 15, paddingRight: spacing.sm },

  // Viewfinder
  viewfinder: {
    flex: 1,
    marginHorizontal: spacing.md,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.cameraViewfinder,
    borderWidth: 1,
    borderColor: colors.cameraLine,
  },
  fill: { flex: 1 },
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    padding: spacing.lg,
  },
  centerText: { textAlign: 'center' },
  centerTitle: { fontFamily: fontFamily.medium, fontSize: 16, textAlign: 'center' },
  permissionButton: { marginTop: spacing.sm, minHeight: 44, paddingHorizontal: spacing.lg },
  hint: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: spacing.md,
    alignItems: 'center',
  },
  hintPill: {
    backgroundColor: 'rgba(17, 16, 20, 0.6)',
    borderRadius: 14,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },

  // Scan frame
  frame: { width: 220, height: 220 },
  corner: { position: 'absolute', width: 34, height: 34, borderColor: colors.onAccent },
  cornerTopLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 14,
  },
  cornerTopRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 14,
  },
  cornerBottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 14,
  },
  cornerBottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 14,
  },

  // Manual entry under the scanner
  manual: { padding: spacing.md, gap: spacing.sm },
  manualRow: { flexDirection: 'row', gap: spacing.xs },
  manualInput: {
    ...typeScale.body,
    flex: 1,
    minHeight: 48,
    color: colors.onAccent,
    borderWidth: 1,
    borderColor: colors.cameraLine,
    borderRadius: brandControl.radius,
    paddingHorizontal: spacing.sm,
  },
  manualButton: { minHeight: 48, paddingHorizontal: spacing.lg },
  error: { color: '#FFB4A9', textAlign: 'center' },

  // Photo controls (M6)
  tray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  thumb: {
    width: 48,
    height: 48,
    borderRadius: brandControl.radius,
    borderWidth: 1,
    borderColor: colors.cameraLine,
    backgroundColor: colors.cameraViewfinder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbImage: { width: '100%', height: '100%' },
  trayCount: { flex: 1 },
  shutter: {
    width: SHUTTER,
    height: SHUTTER,
    borderRadius: SHUTTER / 2,
    borderWidth: 4,
    borderColor: colors.onAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: SHUTTER - 14,
    height: SHUTTER - 14,
    borderRadius: (SHUTTER - 14) / 2,
    backgroundColor: colors.onAccent,
  },
  shutterBusy: { opacity: 0.5 },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
});
