import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { FilterSelect, ListRow, Pill, SearchField, Text } from '@/components';
import { formatRelative } from '@/lib/date';
import { DEMO_STATUSES, useDemoRequests, type DemoRequest } from './demoApi';
import { Loaded, LoadMore, PlatformAdminScreen, plural, RowCard } from './shared';

export const statusOf = (value: string) =>
  DEMO_STATUSES.find((s) => s.value === value) ?? DEMO_STATUSES[0];
export const nameOf = (r: DemoRequest) => `${r.firstName} ${r.lastName}`.trim();

function useDebounced(value: string, ms = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value.trim()), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

/** Demo requests from the website (portal: Admin › Demo requests). */
export function DemoRequests() {
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const list = useDemoRequests(status, useDebounced(search));
  const items = list.data?.pages.flatMap((p) => p.items) ?? [];
  const total = list.data?.pages[0]?.total;
  return (
    <PlatformAdminScreen>
      <SearchField value={search} onChange={setSearch} label="Search name, email or company" />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <FilterSelect
          title="Status"
          value={status}
          allValue=""
          placeholder="Status"
          options={[
            { value: '', label: 'All' },
            ...DEMO_STATUSES.map((s) => ({ value: s.value, label: s.label })),
          ]}
          onChange={setStatus}
        />
        {total !== undefined && (
          <Text variant="caption" color="muted" style={{ marginLeft: 'auto' }}>
            {plural(total, 'request')}
          </Text>
        )}
      </View>
      <Loaded query={list}>
        {() => (
          <RowCard empty="No demo requests match.">
            {items.map((r, i) => {
              const s = statusOf(r.status);
              return (
                <ListRow
                  key={r.id}
                  title={nameOf(r)}
                  subtitle={[r.company, r.email].filter(Boolean).join(' · ')}
                  meta={formatRelative(r.createdAt)}
                  trailing={<Pill label={s.label} tone={s.tone} />}
                  last={i === items.length - 1}
                  onPress={() =>
                    router.push({ pathname: '/admin/demo-requests/[id]', params: { id: r.id } })
                  }
                />
              );
            })}
          </RowCard>
        )}
      </Loaded>
      <LoadMore
        hasMore={!!list.hasNextPage}
        loading={list.isFetchingNextPage}
        onPress={() => list.fetchNextPage()}
      />
    </PlatformAdminScreen>
  );
}
