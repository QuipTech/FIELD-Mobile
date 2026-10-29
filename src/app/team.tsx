import { router, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable } from 'react-native';

import { useRole } from '@/auth/useRole';
import {
  Card,
  DetailScreen,
  ErrorState,
  ListRow,
  NoAccess,
  OptionSheet,
  SearchField,
  SkeletonList,
  Text,
  toast,
} from '@/components';
import { useFeature } from '@/features/billing/entitlements';
import { useTeam, useTeamActions, useTeamRoles, type TeamMember } from '@/features/team/api';
import { errorMessage } from '@/lib/http';

const REMOVE = '__remove__';

function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Organisation admins: who's on the account, their roles, invites and removals. */
export default function TeamRoute() {
  const { capabilities } = useRole();
  // Inviting beyond the plan's seats is a plan feature.
  const canInvite = useFeature('org.users.unlimited');
  const [search, setSearch] = useState('');
  const team = useTeam(useDebounced(search));
  const roles = useTeamRoles();
  const { setRole, remove } = useTeamActions();
  const [selected, setSelected] = useState<TeamMember>();
  const onError = (e: unknown) => toast.show(errorMessage(e));

  if (!capabilities.isOrganisationAdmin) return <NoAccess />;

  const changeRole = (roleId: string | undefined) => {
    if (selected && roleId === REMOVE) return confirmRemove(selected);
    if (selected && roleId && roleId !== selected.roleId) {
      setRole.mutate(
        { userId: selected.id, roleId },
        { onError, onSuccess: () => toast.show('Role updated.') },
      );
    }
  };
  const confirmRemove = (m: TeamMember) =>
    Alert.alert(`Remove ${m.name}?`, 'They lose access to FIELD straight away.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => remove.mutate(m.id, { onError }) },
    ]);

  return (
    <DetailScreen>
      <Stack.Screen
        options={{
          headerRight: () =>
            canInvite ? (
              <Pressable
                onPress={() => router.push('/team-invite')}
                accessibilityRole="button"
                hitSlop={8}
              >
                <Text variant="label" color="primaryStrong">
                  Invite
                </Text>
              </Pressable>
            ) : null,
        }}
      />
      <SearchField value={search} onChange={setSearch} label="Search people" />
      {!team.data ? (
        team.isPending ? (
          <SkeletonList rows={6} />
        ) : (
          <ErrorState error={team.error} onRetry={() => team.refetch()} />
        )
      ) : (
        <Card padded={false} style={{ overflow: 'hidden' }}>
          {team.data.members.map((m, i, all) => (
            <ListRow
              key={m.id}
              title={m.name}
              subtitle={[m.role, m.email].filter(Boolean).join(' · ')}
              last={i === all.length - 1}
              onPress={() => setSelected(m)}
            />
          ))}
        </Card>
      )}
      <OptionSheet<string>
        title={selected ? `Role · ${selected.name}` : undefined}
        options={[
          ...(roles.data ?? []).map((r) => ({ value: r.id, label: r.name })),
          { value: REMOVE, label: 'Remove from team' },
        ]}
        value={selected?.roleId}
        onChange={changeRole}
        onClose={() => setSelected(undefined)}
      />
    </DetailScreen>
  );
}
