import { ArrowRight, GitCompareArrows } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card/Card';
import { Chip } from '@/components/Chip/Chip';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { OptionSheet } from '@/components/OptionSheet/OptionSheet';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { formatShortDate } from '@/lib/date';
import { borders, makeStyles, radii, spacing, useTheme } from '@/theme';
import { compareSnapshots, snapshotVersion, type DiffRow, type DiffSection } from './compare';
import type { ConfigChange } from './records';

export type CompareSnapshotsProps = {
  changes: ConfigChange[];
  fromId: string;
  toId: string;
  /** The server's field-level diff; computed from `changes` when not given. */
  sections?: DiffSection[];
  loading?: boolean;
  error?: unknown;
  onRetry?: () => void;
  onChange: (fromId: string, toId: string) => void;
};

/** M5b Compare two configuration snapshots: removed values struck through, added in green. */
export function CompareSnapshots({
  changes,
  fromId,
  toId,
  onChange,
  ...diff
}: CompareSnapshotsProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const [picking, setPicking] = useState<'from' | 'to'>();
  const sections = diff.sections ?? (diff.loading ? [] : compareSnapshots(changes, fromId, toId));
  const label = (id: string) => {
    const c = changes.find((x) => x.id === id);
    return c ? `v${snapshotVersion(changes, id)} · ${formatShortDate(c.at)}` : 'Pick';
  };
  const options = changes.map((c) => ({ value: c.id, label: `${label(c.id)} — ${c.title}` }));

  return (
    <>
      <View style={styles.pickers}>
        <Chip label={label(fromId)} dropdown onPress={() => setPicking('from')} />
        <ArrowRight size={18} color={colors.muted} strokeWidth={1.8} />
        <Chip label={label(toId)} dropdown onPress={() => setPicking('to')} />
      </View>
      {diff.loading ? (
        <SkeletonList rows={3} />
      ) : diff.error ? (
        <ErrorState error={diff.error} onRetry={diff.onRetry} />
      ) : sections.length === 0 ? (
        <EmptyState
          icon={GitCompareArrows}
          title={fromId === toId || !fromId ? 'Pick two different snapshots' : 'No differences'}
          message="Choose an older snapshot on the left and a newer one on the right."
        />
      ) : (
        sections.map((s) => (
          <Card key={s.title} padded={false} style={styles.card}>
            <Text variant="label" style={styles.sectionTitle}>
              {s.title}
            </Text>
            {s.rows.map((r) => (
              <Row key={r.field} row={r} />
            ))}
          </Card>
        ))
      )}
      <Text variant="caption" color="muted">
        Snapshots are created automatically when parts or details change. They can’t be edited.
      </Text>
      <OptionSheet
        title={picking === 'from' ? 'Compare from' : picking === 'to' ? 'Compare to' : undefined}
        options={options}
        value={picking === 'from' ? fromId : toId}
        onChange={(id) =>
          id && onChange(picking === 'from' ? id : fromId, picking === 'to' ? id : toId)
        }
        onClose={() => setPicking(undefined)}
      />
    </>
  );
}

function Row({ row }: { row: DiffRow }) {
  const styles = useStyles();
  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${row.field}: ${row.before ? `removed ${row.before}, ` : ''}${row.after ? `added ${row.after}` : ''}`}
    >
      <Text variant="caption" color="muted" style={styles.field}>
        {row.field}
      </Text>
      <View style={styles.values}>
        {row.before && (
          <Text variant="caption" color="danger" style={[styles.chip, styles.removed]}>
            {row.before}
          </Text>
        )}
        {row.after && (
          <Text variant="caption" color="success" style={[styles.chip, styles.added]}>
            {row.after}
          </Text>
        )}
      </View>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  pickers: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  card: { overflow: 'hidden' },
  sectionTitle: {
    padding: spacing.sm,
    borderBottomWidth: borders.hairline,
    borderBottomColor: c.border,
  },
  row: { flexDirection: 'row', gap: spacing.xs, padding: spacing.sm, alignItems: 'center' },
  field: { width: 80 },
  values: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: radii.badge, overflow: 'hidden' },
  removed: { backgroundColor: c.dangerTint, textDecorationLine: 'line-through' },
  added: { backgroundColor: c.successTint },
}));
