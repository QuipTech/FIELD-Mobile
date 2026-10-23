import { makeStyles, spacing } from '@/theme';

/** Shared by EmptyState, ErrorState and NoAccess (K4b, K7b, K7d). */
export const useStateStyles = makeStyles((c) => ({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
    paddingHorizontal: 28,
    paddingVertical: spacing.xl,
    gap: spacing.snug,
  },
  tile: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: c.fill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerTile: { backgroundColor: c.dangerTint },
  text: { gap: 6 },
  actions: { gap: spacing.tight, marginTop: 6, alignItems: 'flex-start' },
  // OfflineNotice (K7c banner)
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.tight,
    paddingVertical: 6,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    backgroundColor: c.warningTint,
  },
  noticeText: { flex: 1 },
}));
