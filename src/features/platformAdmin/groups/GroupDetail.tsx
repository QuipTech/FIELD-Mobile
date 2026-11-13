import { router, Stack } from 'expo-router';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, View } from 'react-native';

import { ActionSheet } from '@/components/ActionSheet/ActionSheet';
import { IconButton } from '@/components/Button/IconButton';
import { Segmented } from '@/components/Segmented/Segmented';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { errorMessage } from '@/lib/http';
import { usePullRefresh } from '@/lib/usePullRefresh';
import { fontFamily, makeStyles } from '@/theme';
import { Loaded, PlatformAdminScreen } from '../shared';
import { AccessTab } from './AccessTab';
import { ActivityTab } from './ActivityTab';
import { groupKeys, useGroupMutations, useMachineGroup, type MachineGroup } from './groupsApi';
import { GroupDot, GroupSheet } from './GroupSheet';
import { MachinesTab } from './MachinesTab';

type Tab = 'machines' | 'access' | 'activity';

function Stats({ group: g }: { group: MachineGroup }) {
  const styles = useStyles();
  const tiles = [
    [g.machineCount, g.machineCount === 1 ? 'machine' : 'machines'],
    [g.organisationCount, g.organisationCount === 1 ? 'organisation' : 'organisations'],
    [g.userCount, g.userCount === 1 ? 'person' : 'people'],
  ] as const;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {tiles.map(([n, label]) => (
        <View key={label} style={styles.tile} accessible accessibilityLabel={`${n} ${label}`}>
          <Text style={styles.value}>{n}</Text>
          <Text variant="caption" color="muted">
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function confirmDeleteGroup(
  g: MachineGroup,
  remove: ReturnType<typeof useGroupMutations>['remove']['mutate'],
) {
  Alert.alert(`Delete ${g.name}?`, "Everyone loses access to this group's machines.", [
    { text: 'Cancel', style: 'cancel' },
    {
      text: 'Delete',
      style: 'destructive',
      onPress: () =>
        remove(g.id, {
          onSuccess: () => {
            toast.show(`${g.name} deleted.`);
            router.back();
          },
          onError: (e) => toast.show(errorMessage(e)),
        }),
    },
  ]);
}

/** Colour dot and name as the title; ⋯ for Edit and Delete. */
function GroupHeader({ group: g, onMenu }: { group?: MachineGroup; onMenu: () => void }) {
  return (
    <Stack.Screen
      options={{
        headerTitle: () => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, maxWidth: 220 }}>
            <GroupDot colour={g?.colour} />
            <Text style={{ fontFamily: fontFamily.semibold }} numberOfLines={1}>
              {g?.name ?? 'Machine group'}
            </Text>
          </View>
        ),
        headerRight: () =>
          g ? (
            <IconButton icon={MoreHorizontal} accessibilityLabel="Group actions" onPress={onMenu} />
          ) : null,
      }}
    />
  );
}

/** One group: its machines, who it's shared with, and what changed. */
export function GroupDetail({ groupId }: { groupId: string }) {
  const group = useMachineGroup(groupId);
  const { update, remove } = useGroupMutations();
  const pull = usePullRefresh(groupKeys.one(groupId));
  const [tab, setTab] = useState<Tab>('machines');
  // Tabs load the first time they're opened, then stay loaded.
  const [seen, setSeen] = useState<Set<Tab>>(new Set(['machines']));
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const g = group.data;

  const confirmDelete = () => g && confirmDeleteGroup(g, remove.mutate);

  return (
    <PlatformAdminScreen {...pull}>
      <GroupHeader group={g} onMenu={() => setMenu(true)} />
      <Loaded query={group}>
        {() => (
          <>
            {!!g?.description && <Text color="muted">{g.description}</Text>}
            {g && <Stats group={g} />}
            <Segmented
              options={[
                { value: 'machines', label: 'Machines' },
                { value: 'access', label: 'Access' },
                { value: 'activity', label: 'Activity' },
              ]}
              value={tab}
              onChange={(t) => {
                setTab(t);
                setSeen((s) => new Set(s).add(t));
              }}
              accessibilityLabel="Group view"
            />
            {seen.has('machines') && tab === 'machines' && <MachinesTab groupId={groupId} />}
            {seen.has('access') && tab === 'access' && <AccessTab groupId={groupId} />}
            {seen.has('activity') && tab === 'activity' && <ActivityTab groupId={groupId} />}
          </>
        )}
      </Loaded>
      <ActionSheet
        visible={menu}
        title={g?.name ?? ''}
        onClose={() => setMenu(false)}
        actions={[
          { label: 'Edit', icon: Pencil, onPress: () => setEditing(true) },
          { label: 'Delete', icon: Trash2, destructive: true, onPress: confirmDelete },
        ]}
      />
      {g && (
        <GroupSheet
          key={editing ? 'open' : 'closed'}
          visible={editing}
          group={g}
          onClose={() => setEditing(false)}
          onSave={(input) => update.mutateAsync({ id: g.id, ...input })}
        />
      )}
    </PlatformAdminScreen>
  );
}

const useStyles = makeStyles((c) => ({
  tile: {
    flex: 1,
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 12,
    gap: 2,
  },
  value: { fontFamily: fontFamily.semibold, fontSize: 20 },
}));
