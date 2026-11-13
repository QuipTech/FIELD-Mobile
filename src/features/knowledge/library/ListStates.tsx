import { FileSearch } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Skeleton } from '@/components/Skeleton/Skeleton';
import { Text } from '@/components/Text/Text';
import { errorMessage } from '@/lib/http';
import { makeStyles } from '@/theme';

/** Six placeholder cards for the first page. */
export function SkeletonCards() {
  const styles = useStyles();
  return (
    <View style={{ gap: 12 }} accessibilityLabel="Loading documents">
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={styles.card}>
          <Skeleton width="35%" height={16} />
          <Skeleton width="90%" height={18} />
          <Skeleton width="100%" height={12} />
          <Skeleton width="70%" height={12} />
        </View>
      ))}
    </View>
  );
}

/** Inline error with Retry; the results already loaded stay visible around it. */
export function ErrorBanner({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.error} accessibilityRole="alert">
      <Text variant="caption" color="danger" style={{ flex: 1 }}>
        {errorMessage(error) || "Couldn't load documents."}
      </Text>
      <Button label="Retry" size="small" variant="secondary" onPress={onRetry} />
    </View>
  );
}

export function EmptyResults({ filtered, onClear }: { filtered: boolean; onClear: () => void }) {
  if (!filtered) {
    return (
      <EmptyPanel
        icon={FileSearch}
        title="No documents yet"
        message="Documents appear here once they're indexed and live."
      />
    );
  }
  return (
    <EmptyPanel
      icon={FileSearch}
      title="Nothing matches"
      message="Try other words or clear a filter."
      action={{ label: 'Clear filters', onPress: onClear }}
    />
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 8,
  },
  error: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: c.dangerTint,
    marginBottom: 12,
  },
}));
