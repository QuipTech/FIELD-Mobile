import { ChevronDown, ChevronRight, Download, GitCompareArrows } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { formatDateTime } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { colors, fontFamily, makeStyles, radii, spacing } from '@/theme';
import { NotActive } from './NotActive';
import {
  exportSnapshotDiff,
  TRIGGER_LABEL,
  useSnapshotDiff,
  type Snapshot,
  type SnapshotDiff,
  type SnapshotDiffRow,
} from './snapshots';

const KIND = {
  changed: { label: 'Changed', fg: colors.amber, bg: colors.amberTint },
  added: { label: 'Added', fg: colors.success, bg: colors.successBg },
  removed: { label: 'Removed', fg: colors.danger, bg: colors.dangerTint },
} as const;

const describe = (s: Snapshot) => `${formatDateTime(s.takenAt)} · ${TRIGGER_LABEL[s.trigger]}`;

/** Two snapshots side by side (older → newer): changes coloured by kind, the rest collapsed. */
export function SnapshotCompare({
  machineId,
  from,
  to,
}: {
  machineId: string;
  from: string;
  to: string;
}) {
  const diff = useSnapshotDiff(machineId, from, to);

  if (diff.error && !diff.data) {
    return (
      <DetailScreen>
        <NotActive machineId={machineId} error={diff.error} onRetry={() => void diff.refetch()} />
      </DetailScreen>
    );
  }
  const d = diff.data;
  return (
    <DetailScreen
      onRefresh={() => void diff.refetch()}
      refreshing={diff.isRefetching}
      footer={d && <ExportButtons machineId={machineId} from={from} to={to} />}
    >
      {!d ? (
        <SkeletonList rows={4} />
      ) : (
        <>
          <Text variant="caption" color="muted">
            From {describe(d.from)}
            {'\n'}To {describe(d.to)}
          </Text>
          {d.rows.length === 0 ? (
            <EmptyPanel icon={GitCompareArrows} title="No differences" />
          ) : (
            <Card padded={false}>
              {d.rows.map((r, i) => (
                <DiffRow key={`${r.componentName}-${i}`} row={r} last={i === d.rows.length - 1} />
              ))}
            </Card>
          )}
          <Unchanged items={d.unchanged} />
        </>
      )}
    </DetailScreen>
  );
}

function ExportButtons({ machineId, from, to }: { machineId: string; from: string; to: string }) {
  const styles = useStyles();
  const [exporting, setExporting] = useState<'csv' | 'pdf'>();
  const exportAs = async (format: 'csv' | 'pdf') => {
    setExporting(format);
    try {
      await exportSnapshotDiff(machineId, from, to, format);
    } catch (e) {
      toast.show(errorMessage(e));
    } finally {
      setExporting(undefined);
    }
  };
  return (
    <View style={styles.exports}>
      {(['csv', 'pdf'] as const).map((f) => (
        <View key={f} style={{ flex: 1 }}>
          <Button
            label={`Export ${f.toUpperCase()}`}
            icon={Download}
            variant="secondary"
            onPress={() => void exportAs(f)}
            loading={exporting === f}
            disabled={!!exporting}
          />
        </View>
      ))}
    </View>
  );
}

function Unchanged({ items }: { items: SnapshotDiff['unchanged'] }) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;
  return (
    <>
      <Pressable
        onPress={() => setOpen(!open)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        {open ? (
          <ChevronDown size={18} color={colors.inkMuted} />
        ) : (
          <ChevronRight size={18} color={colors.inkMuted} />
        )}
        <Text color="muted">Unchanged ({items.length})</Text>
      </Pressable>
      {open &&
        items.map((u) => (
          <View key={u.componentName} style={styles.same}>
            <Text style={{ flex: 1 }}>{u.componentName}</Text>
            <Text color="muted">{u.value ?? '—'}</Text>
          </View>
        ))}
    </>
  );
}

function DiffRow({ row, last }: { row: SnapshotDiffRow; last: boolean }) {
  const styles = useStyles();
  const k = KIND[row.kind];
  return (
    <View
      style={[styles.row, !last && styles.divider]}
      accessible
      accessibilityLabel={`${k.label}: ${row.componentName}, ${row.before ?? 'none'} to ${row.after ?? 'none'}`}
    >
      <View style={styles.head}>
        <Text style={{ fontFamily: fontFamily.medium, flex: 1 }}>{row.componentName}</Text>
        <Text variant="caption" style={[styles.badge, { color: k.fg, backgroundColor: k.bg }]}>
          {k.label}
        </Text>
      </View>
      <Text variant="caption" color="muted">
        <Text variant="caption" style={row.before ? styles.before : undefined}>
          {row.before ?? '—'}
        </Text>
        {'  →  '}
        <Text variant="caption" style={{ color: k.fg }}>
          {row.after ?? '—'}
        </Text>
      </Text>
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  exports: { flexDirection: 'row', gap: spacing.xs },
  row: { padding: spacing.sm, gap: 4 },
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.badge,
    overflow: 'hidden',
  },
  before: { textDecorationLine: 'line-through' },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  same: { flexDirection: 'row', gap: 8, paddingHorizontal: spacing.xs },
}));
