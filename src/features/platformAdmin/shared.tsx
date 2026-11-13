import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useRole } from '@/auth/useRole';
import { Button, Card, DetailScreen, ErrorState, NoAccess, SkeletonList, Text } from '@/components';
import { spacing } from '@/theme';

/** Platform admin screens: `platform.manage` only (the API enforces it too). */
export function PlatformAdminScreen({
  children,
  ...rest
}: {
  children: ReactNode;
  footer?: ReactNode;
  header?: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { capabilities, loaded } = useRole();
  if (loaded && !capabilities.isPlatformAdmin) return <NoAccess />;
  return <DetailScreen {...rest}>{children}</DetailScreen>;
}

type QueryState = { data: unknown; error: unknown; isPending: boolean; refetch: () => unknown };

/** Skeleton while loading, Retry on error (NoAccess on 403), otherwise the content. */
export function Loaded({ query, children }: { query: QueryState; children: () => ReactNode }) {
  if (query.data !== undefined) return <>{children()}</>;
  if (query.isPending) return <SkeletonList rows={6} />;
  return <ErrorState error={query.error} onRetry={() => query.refetch()} />;
}

/** Full-bleed rows in a card, or a quiet line when there is nothing to show. */
export function RowCard({ empty, children }: { empty: string; children: ReactNode[] }) {
  if (children.length === 0)
    return (
      <Text variant="caption" color="muted" style={{ textAlign: 'center', padding: spacing.md }}>
        {empty}
      </Text>
    );
  return (
    <Card padded={false} style={{ overflow: 'hidden' }}>
      {children}
    </Card>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text variant="label" color="muted" accessibilityRole="header">
      {children}
    </Text>
  );
}

/** Label / value line for detail cards. */
export function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={{ gap: 2 }}>
      <Text variant="caption" color="muted">
        {label}
      </Text>
      <Text>{value || '—'}</Text>
    </View>
  );
}

export function LoadMore({
  hasMore,
  loading,
  onPress,
}: {
  hasMore: boolean;
  loading: boolean;
  onPress: () => void;
}) {
  if (!hasMore) return null;
  return <Button label="Load more" variant="secondary" loading={loading} onPress={onPress} />;
}

export const plural = (n: number, word: string) =>
  `${n.toLocaleString('en-AU')} ${word}${n === 1 ? '' : 's'}`;
