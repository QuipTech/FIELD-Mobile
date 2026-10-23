import { View } from 'react-native';

import { borders, layout, makeStyles, radii, spacing } from '@/theme';
import { Skeleton } from './Skeleton';

export type SkeletonListProps = {
  rows?: number;
  /** Include the 44 px leading tile, as on icon rows. */
  withTile?: boolean;
};

/** List-shaped loading state that matches ListRow, so nothing jumps when data arrives (K7a). */
export function SkeletonList({ rows = 6, withTile = false }: SkeletonListProps) {
  const styles = useStyles();
  return (
    <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={[styles.row, i === rows - 1 && styles.last]}>
          {withTile && <Skeleton width={44} height={44} radius={radii.control} />}
          <View style={styles.lines}>
            <Skeleton width="62%" height={14} />
            <Skeleton width="38%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderWidth: borders.hairline,
    borderColor: c.border,
    borderRadius: radii.card,
    overflow: 'hidden',
  },
  row: {
    minHeight: layout.rowHeight,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.snug,
    paddingHorizontal: spacing.snug,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  last: { borderBottomWidth: 0 },
  lines: { flex: 1, gap: spacing.xs },
}));
