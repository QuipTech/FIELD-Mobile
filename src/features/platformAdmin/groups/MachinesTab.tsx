import { router } from 'expo-router';
import { Plus, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet/ActionSheet';
import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Pill, type PillTone } from '@/components/Pill/Pill';
import { SwipeRow } from '@/components/SwipeRow/SwipeRow';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { formatShortDate } from '@/lib/date';
import { errorMessage } from '@/lib/http';
import { fontFamily, makeStyles } from '@/theme';
import { Loaded } from '../shared';
import {
  useGroupMachines,
  useGroupMembers,
  type GroupMachine,
  type PlatformMachine,
} from './groupsApi';

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  running: { label: 'Running', tone: 'success' },
  down: { label: 'Down', tone: 'danger' },
  service_due: { label: 'Service due', tone: 'amber' },
};
const LIFECYCLE: Record<string, { label: string; tone: PillTone }> = {
  registered: { label: 'Not activated', tone: 'amber' },
  active: { label: 'Active', tone: 'success' },
  archived: { label: 'Archived', tone: 'muted' },
  sold: { label: 'Sold', tone: 'muted' },
};

/** Label, make/model, serial and owner, with status and lifecycle badges. */
export function MachineSummary({ machine: m }: { machine: GroupMachine | PlatformMachine }) {
  const status = m.status ? STATUS[m.status] : undefined;
  const life = m.lifecycleState ? LIFECYCLE[m.lifecycleState] : undefined;
  return (
    <View style={{ flex: 1, gap: 2 }}>
      <Text style={{ fontFamily: fontFamily.medium }} numberOfLines={1}>
        {m.label}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={1}>
        {[
          [m.manufacturer, m.model].filter(Boolean).join(' '),
          m.serialNumber && `S/N ${m.serialNumber}`,
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {!!m.owningOrganisation && (
        <Text variant="caption" color="muted" numberOfLines={1}>
          {m.owningOrganisation.name}
        </Text>
      )}
      {(status || life) && (
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
          {status && <Pill label={status.label} tone={status.tone} />}
          {life && <Pill label={life.label} tone={life.tone} />}
        </View>
      )}
    </View>
  );
}

function MachineRow(props: { machine: GroupMachine; onRemove: () => void; last: boolean }) {
  const styles = useStyles();
  const [menu, setMenu] = useState(false);
  const actions = [{ label: 'Remove', icon: Trash2, destructive: true, onPress: props.onRemove }];
  return (
    <View style={!props.last && styles.divider}>
      <SwipeRow actions={actions}>
        <Pressable
          onLongPress={() => setMenu(true)}
          style={styles.row}
          accessibilityHint="Swipe left or long press to remove"
        >
          <MachineSummary machine={props.machine} />
          <Text variant="caption" color="muted">
            Added {formatShortDate(props.machine.addedAt)}
          </Text>
        </Pressable>
      </SwipeRow>
      <ActionSheet
        visible={menu}
        title={props.machine.label}
        actions={actions}
        onClose={() => setMenu(false)}
      />
    </View>
  );
}

/** The group's machines; swipe to remove, "Add machines" to pick more. */
export function MachinesTab({ groupId }: { groupId: string }) {
  const machines = useGroupMachines(groupId, true);
  const { removeMachine } = useGroupMembers(groupId);
  const list = machines.data ?? [];

  const confirmRemove = (m: GroupMachine) =>
    Alert.alert(`Remove ${m.label}?`, 'People who see this group stop seeing this machine.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () =>
          removeMachine.mutate(m.id, {
            onSuccess: () => toast.show(`${m.label} removed.`),
            onError: (e) => toast.show(errorMessage(e)),
          }),
      },
    ]);

  return (
    <>
      <Button
        label="Add machines"
        icon={Plus}
        variant="secondary"
        onPress={() =>
          router.push({
            pathname: '/admin/machine-groups/[id]/add-machines',
            params: { id: groupId },
          })
        }
      />
      <Loaded query={machines}>
        {() =>
          list.length === 0 ? (
            <Text color="muted" style={{ textAlign: 'center', padding: 16 }}>
              No machines in this group yet.
            </Text>
          ) : (
            <Card padded={false} style={{ overflow: 'hidden' }}>
              {list.map((m, i) => (
                <MachineRow
                  key={m.id}
                  machine={m}
                  onRemove={() => confirmRemove(m)}
                  last={i === list.length - 1}
                />
              ))}
            </Card>
          )
        }
      </Loaded>
    </>
  );
}

const useStyles = makeStyles((c) => ({
  divider: { borderBottomWidth: 1, borderBottomColor: c.border },
  row: { flexDirection: 'row', gap: 10, padding: 14, backgroundColor: c.card },
}));
