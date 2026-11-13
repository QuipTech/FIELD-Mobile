import { Stack } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { Pressable } from 'react-native';

import { Avatar, ListRow, SearchField, Segmented, Text } from '@/components';
import { useTheme } from '@/theme';
import { formatDateTime, formatRelative } from '@/lib/date';
import { useAuditLog, type AuditEvent, type AuditRange } from './api';
import { Loaded, LoadMore, PlatformAdminScreen, plural, RowCard } from './shared';

const RANGES: { value: AuditRange; label: string }[] = [
  { value: '1', label: '24 h' },
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: 'all', label: 'All' },
];

const SOURCE: Record<string, string> = { web: 'Web', mobile: 'Mobile', system: 'System' };

/** The API has no text search, so searching pulls in older pages, up to this many events. */
const SEARCH_LIMIT = 1000;

const matches = (e: AuditEvent, q: string) =>
  [e.actionLabel, e.actor?.name, e.organisationName, e.target, e.source && SOURCE[e.source]].some(
    (v) => v?.toLowerCase().includes(q),
  );

function SearchToggle({ open, onPress }: { open: boolean; onPress: () => void }) {
  const { colors } = useTheme();
  const Icon = open ? X : Search;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel={open ? 'Close search' : 'Search audit log'}
    >
      <Icon size={22} color={colors.ink} strokeWidth={2} />
    </Pressable>
  );
}

/** Who did what, newest first (portal: Admin › Audit log). CSV export stays in the portal. */
export function AuditLog() {
  const [range, setRange] = useState<AuditRange>('7');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState('');
  const log = useAuditLog(range);
  const all = useMemo(() => log.data?.pages.flatMap((p) => p.items) ?? [], [log.data]);
  const total = log.data?.pages[0]?.total;
  const q = search.trim().toLowerCase();
  const events = q ? all.filter((e) => matches(e, q)) : all;
  const { hasNextPage, isFetchingNextPage, fetchNextPage } = log;

  // Searching covers the whole range, not just the first page.
  useEffect(() => {
    if (q && hasNextPage && !isFetchingNextPage && all.length < SEARCH_LIMIT) void fetchNextPage();
  }, [q, hasNextPage, isFetchingNextPage, all.length, fetchNextPage]);

  const toggleSearch = () => {
    if (searching) setSearch('');
    setSearching(!searching);
  };

  return (
    <PlatformAdminScreen>
      <Stack.Screen
        options={{ headerRight: () => <SearchToggle open={searching} onPress={toggleSearch} /> }}
      />
      {searching && (
        <SearchField
          value={search}
          onChange={setSearch}
          label="Search people, actions or targets"
          autoFocus
        />
      )}
      <Segmented
        options={RANGES}
        value={range}
        onChange={setRange}
        accessibilityLabel="Time range"
      />
      {total !== undefined && (
        <Text variant="caption" color="muted">
          {q
            ? `${events.length.toLocaleString('en-AU')} ${events.length === 1 ? 'match' : 'matches'}${hasNextPage && all.length < SEARCH_LIMIT ? ' so far…' : ''}`
            : plural(total, 'event')}
        </Text>
      )}
      <Loaded query={log}>
        {() => (
          <RowCard empty={q ? 'No events match your search.' : 'No events in this period.'}>
            {events.map((e, i) => {
              const who = e.actor?.name ?? 'System';
              return (
                <ListRow
                  key={e.id}
                  leading={<Avatar name={who} imageUrl={e.actor?.avatarUrl} size={36} />}
                  title={e.actionLabel ?? 'Event'}
                  subtitle={[who, e.organisationName, e.target, e.source && SOURCE[e.source]]
                    .filter(Boolean)
                    .join(' · ')}
                  meta={formatRelative(e.occurredAt)}
                  accessibilityLabel={`${e.actionLabel}, ${who}, ${e.target ?? ''}, ${formatDateTime(e.occurredAt)}`}
                  last={i === events.length - 1}
                />
              );
            })}
          </RowCard>
        )}
      </Loaded>
      <LoadMore
        hasMore={!q && !!log.hasNextPage}
        loading={log.isFetchingNextPage}
        onPress={() => log.fetchNextPage()}
      />
    </PlatformAdminScreen>
  );
}
