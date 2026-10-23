import { borders, makeStyles, radii, spacing } from '@/theme';

export const useStyles = makeStyles((c) => ({
  background: {
    backgroundColor: c.card,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
  },
  grab: { width: 40, height: 5, borderRadius: 3, backgroundColor: c.borderStrong },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: spacing.md,
    paddingRight: spacing.xxs,
  },
  title: { flex: 1 },
  body: { paddingHorizontal: spacing.md, paddingTop: spacing.xs, gap: spacing.md },
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: borders.hairline,
    borderTopColor: c.border,
    backgroundColor: c.card,
  },
}));
