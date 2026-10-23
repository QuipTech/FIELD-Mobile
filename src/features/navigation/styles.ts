import { StyleSheet } from 'react-native';

import { fontFamily, makeStyles } from '@/theme';

export const BAR_PADDING = 8;
export const PILL = { width: 48, height: 30 } as const;
export const AI_SIZE = 60;
/** How far the AI button rises above the bar's top edge. */
export const AI_LIFT = 26;

export const useStyles = makeStyles((c) => ({
  // Screen-coloured strip the floating bar sits on.
  backdrop: { backgroundColor: c.bg, paddingHorizontal: 16, paddingTop: AI_LIFT - 6 },
  bar: {
    flexDirection: 'row',
    padding: BAR_PADDING,
    backgroundColor: c.card,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: c.border,
    shadowColor: c.primaryStrong,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  // Slides under the active tab's icon.
  pill: {
    position: 'absolute',
    top: BAR_PADDING,
    left: 0,
    width: PILL.width,
    height: PILL.height,
    borderRadius: PILL.height / 2,
    backgroundColor: c.primaryTint,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, minHeight: 48 },
  iconWrap: { height: PILL.height, justifyContent: 'center', alignItems: 'center' },
  label: { fontFamily: fontFamily.medium, fontSize: 11, lineHeight: 14, color: c.faint },
  labelOn: { fontFamily: fontFamily.semibold, color: c.primary },

  // Centre AI button: raised above the bar, with a card-coloured ring cut-out.
  aiSlot: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minHeight: 48 },
  aiFloat: {
    position: 'absolute',
    top: -AI_LIFT - BAR_PADDING,
    width: AI_SIZE + 12,
    height: AI_SIZE + 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiHalo: {
    position: 'absolute',
    width: AI_SIZE,
    height: AI_SIZE,
    borderRadius: AI_SIZE / 2,
    backgroundColor: c.scanLine,
  },
  aiRing: { position: 'absolute' },
  aiButton: {
    width: AI_SIZE,
    height: AI_SIZE,
    borderRadius: AI_SIZE / 2,
    borderWidth: 3,
    borderColor: c.card,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: c.primary,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
}));
