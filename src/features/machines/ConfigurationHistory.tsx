import { Camera, GitCompareArrows, Settings2 } from 'lucide-react-native';
import { Alert, View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { toast } from '@/components/Toast/store';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { formatDateTime } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { NotActive } from './NotActive';
import { useSnapshotActions, useSnapshots, type Snapshot } from './snapshots';
import { SnapshotRow } from './SnapshotRow';
import { styles } from './styles';

export type ConfigurationHistoryProps = {
  machineId: string;
  selected: string[];
  onSelect: (ids: string[]) => void;
  onCompare: (a: string, b: string) => void;
  /** `history.create` */
  canTake: boolean;
  /** `machine.manage`: known good and restore. */
  canManage: boolean;
};

/** Configuration history: take, compare (pick two), mark known good, restore. */
export function ConfigurationHistory(props: ConfigurationHistoryProps) {
  const { machineId, selected, onSelect, canManage } = props;
  const list = useSnapshots(machineId);
  const actions = useSnapshotActions(machineId);
  const fail = (e: unknown) => toast.show(errorMessage(e));

  const toggle = (id: string) =>
    onSelect(
      selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id].slice(-2),
    );
  const confirmRestore = useConfirmRestore(actions.restore.mutate, fail);

  if (list.error && !list.data) {
    return (
      <DetailScreen onRefresh={() => void list.refetch()} refreshing={list.isRefetching}>
        <NotActive machineId={machineId} error={list.error} onRetry={() => void list.refetch()} />
      </DetailScreen>
    );
  }
  const snapshots = list.data ?? [];
  return (
    <DetailScreen
      onRefresh={() => void list.refetch()}
      refreshing={list.isRefetching}
      footer={
        <Footer
          count={snapshots.length}
          selected={selected}
          onCompare={props.onCompare}
          onTake={
            props.canTake
              ? () =>
                  actions.take.mutate(undefined, {
                    onSuccess: () => toast.show('Snapshot taken.'),
                    onError: fail,
                  })
              : undefined
          }
          taking={actions.take.isPending}
        />
      }
    >
      {list.isPending ? (
        <SkeletonList rows={4} />
      ) : snapshots.length === 0 ? (
        <EmptyPanel
          icon={Settings2}
          title="No snapshots yet"
          message="Snapshots record the machine's components and versions at a point in time."
        />
      ) : (
        snapshots.map((s) => (
          <SnapshotRow
            key={s.id}
            snapshot={s}
            selected={selected.includes(s.id)}
            onToggle={() => toggle(s.id)}
            onKnownGood={
              canManage
                ? () =>
                    actions.knownGood.mutate(
                      { snapshotId: s.id, isKnownGood: !s.isKnownGood },
                      { onError: fail },
                    )
                : undefined
            }
            onRestore={canManage ? () => confirmRestore(s) : undefined}
          />
        ))
      )}
    </DetailScreen>
  );
}

/** Restore after a confirmation ("Puts the recorded configuration back…"). */
function useConfirmRestore(
  restore: ReturnType<typeof useSnapshotActions>['restore']['mutate'],
  fail: (e: unknown) => void,
) {
  return (s: Snapshot) =>
    Alert.alert(
      'Restore this snapshot?',
      `Puts the recorded configuration back to this snapshot (${formatDateTime(s.takenAt)}).`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () =>
            restore(s.id, {
              onSuccess: () => toast.show('Configuration restored.'),
              onError: fail,
            }),
        },
      ],
    );
}

function Footer(props: {
  count: number;
  selected: string[];
  onCompare: (a: string, b: string) => void;
  onTake?: () => void;
  taking: boolean;
}) {
  const [a, b] = props.selected;
  return (
    <View style={styles.footerStack}>
      {props.count > 1 && (
        <Button
          label={a && b ? 'Compare selected' : `Select ${2 - props.selected.length} to compare`}
          icon={GitCompareArrows}
          onPress={() => a && b && props.onCompare(a, b)}
          disabled={!a || !b}
        />
      )}
      {props.onTake && (
        <Button
          label="Take snapshot"
          icon={Camera}
          variant="secondary"
          loading={props.taking}
          onPress={props.onTake}
        />
      )}
    </View>
  );
}
