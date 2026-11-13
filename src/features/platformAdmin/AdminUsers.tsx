import { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Avatar,
  FilterSelect,
  ListRow,
  Pill,
  SearchField,
  Text,
  type PillTone,
} from '@/components';
import { formatRelative } from '@/lib/date';
import { useAdminUsers, type AdminUser } from './api';
import { Loaded, PlatformAdminScreen, plural, RowCard } from './shared';

const STATUS: Record<string, { label: string; tone: PillTone }> = {
  active: { label: 'Active', tone: 'brand' },
  invited: { label: 'Invited', tone: 'amber' },
  disabled: { label: 'Suspended', tone: 'danger' },
};

const fullName = (u: AdminUser) => `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;

function lastSeen(u: AdminUser) {
  if (u.status === 'invited') return u.createdAt ? `Invited ${formatRelative(u.createdAt)}` : '';
  return u.lastActiveAt ? formatRelative(u.lastActiveAt) : 'Never';
}

/** Everyone on the platform, across organisations (portal: Admin › Users). */
export function AdminUsers() {
  const users = useAdminUsers();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (users.data ?? []).filter(
      (u) =>
        (status === 'all' || u.status === status) &&
        (!q ||
          [fullName(u), u.email, u.organisation?.name ?? ''].some((v) =>
            v.toLowerCase().includes(q),
          )),
    );
  }, [users.data, search, status]);

  return (
    <PlatformAdminScreen>
      <SearchField value={search} onChange={setSearch} label="Search users" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <FilterSelect
          title="Status"
          value={status}
          allValue="all"
          placeholder="Status"
          options={[
            { value: 'all', label: 'All' },
            ...Object.entries(STATUS).map(([value, s]) => ({ value, label: s.label })),
          ]}
          onChange={setStatus}
        />
        {users.data && (
          <Text variant="caption" color="muted" style={{ marginLeft: 'auto' }}>
            {plural(shown.length, 'user')}
          </Text>
        )}
      </View>
      <Loaded query={users}>
        {() => (
          <RowCard empty="No users match.">
            {shown.map((u, i) => {
              const s = STATUS[u.status ?? ''];
              return (
                <ListRow
                  key={u.id}
                  leading={<Avatar name={fullName(u)} imageUrl={u.avatarUrl} size={40} />}
                  title={fullName(u)}
                  subtitle={[
                    u.email,
                    u.organisation?.name,
                    u.roles?.length ? u.roles.join(', ') : 'No role',
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                  meta={lastSeen(u)}
                  trailing={s ? <Pill label={s.label} tone={s.tone} /> : undefined}
                  last={i === shown.length - 1}
                />
              );
            })}
          </RowCard>
        )}
      </Loaded>
    </PlatformAdminScreen>
  );
}
