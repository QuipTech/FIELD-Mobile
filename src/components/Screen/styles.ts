import { makeStyles, spacing } from '@/theme';

export const useStyles = makeStyles((c) => ({
  root: { flex: 1, backgroundColor: c.bg },
  content: { padding: spacing.md, gap: spacing.loose },
  grow: { flexGrow: 1 },
}));
