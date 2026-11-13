import { router, Stack } from 'expo-router';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { IconButton } from '@/components/Button/IconButton';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { usePullRefresh } from '@/lib/usePullRefresh';
import { fontFamily, makeStyles } from '@/theme';
import { Loaded, PlatformAdminScreen } from '../shared';
import { groupKeys, useGroupMutations, useMachineGroups, type MachineGroup } from './groupsApi';
import { GroupDot, GroupSheet } from './GroupSheet';

export const groupStats = (g: MachineGroup) =>
  `${g.machineCount} machine${g.machineCount === 1 ? '' : 's'} · ${g.organisationCount} org${
    g.organisationCount === 1 ? '' : 's'
  } · ${g.userCount} ${g.userCount === 1 ? 'person' : 'people'}`;

function GroupCard({ group: g }: { group: MachineGroup }) {
  const styles = useStyles();
  return (
    <Pressable
      onPress={() => router.push({ pathname: '/admin/machine-groups/[id]', params: { id: g.id } })}
      style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
      accessibilityRole="button"
      accessibilityLabel={`${g.name}, ${groupStats(g)}`}
    >
      <View style={styles.row}>
        <GroupDot colour={g.colour} />
        <Text style={styles.title} numberOfLines={1}>
          {g.name}
        </Text>
      </View>
      {!!g.description && (
        <Text variant="caption" color="muted" numberOfLines={2}>
          {g.description}
        </Text>
      )}
      <Text variant="caption" color="muted">
        {groupStats(g)}
      </Text>
    </Pressable>
  );
}

/** Global machine groups (portal: Admin › Machine groups). */
export function MachineGroups() {
  const groups = useMachineGroups();
  const { create } = useGroupMutations();
  const pull = usePullRefresh(groupKeys.list);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const q = query.trim().toLowerCase();
  const shown = (groups.data ?? []).filter((g) => !q || g.name.toLowerCase().includes(q));

  return (
    <PlatformAdminScreen
      {...pull}
      header={<SearchField value={query} onChange={setQuery} label="Search groups" />}
    >
      <Stack.Screen
        options={{
          headerRight: () => (
            <IconButton
              icon={Plus}
              accessibilityLabel="New group"
              onPress={() => setAdding(true)}
            />
          ),
        }}
      />
      <Loaded query={groups}>
        {() =>
          shown.length === 0 ? (
            <Text color="muted" style={{ textAlign: 'center', padding: 24 }}>
              {q
                ? 'No groups match.'
                : 'No groups yet. Create one to share machines across organisations.'}
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {shown.map((g) => (
                <GroupCard key={g.id} group={g} />
              ))}
            </View>
          )
        }
      </Loaded>
      <GroupSheet
        key={adding ? 'open' : 'closed'}
        visible={adding}
        onClose={() => setAdding(false)}
        onSave={async (input) => {
          const g = await create.mutateAsync(input);
          router.push({ pathname: '/admin/machine-groups/[id]', params: { id: g.id } });
        }}
      />
    </PlatformAdminScreen>
  );
}

const useStyles = makeStyles((c) => ({
  card: {
    backgroundColor: c.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: c.border,
    padding: 14,
    gap: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: fontFamily.semibold, fontSize: 16 },
}));
