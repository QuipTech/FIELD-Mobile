import { View } from 'react-native';

import { Skeleton } from './Skeleton';
import { styles } from './styles';

export type SkeletonListProps = { rows?: number };

/** List-shaped loading placeholder, matching ListRow proportions. */
export function SkeletonList({ rows = 6 }: SkeletonListProps) {
  return (
    <View accessibilityRole="progressbar" accessibilityLabel="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width="60%" height={16} />
          <Skeleton width="35%" height={12} />
        </View>
      ))}
    </View>
  );
}
