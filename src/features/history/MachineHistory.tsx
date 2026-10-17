import { History } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { FilterChip } from '@/components/FilterChip/FilterChip';
import { TimelineRow } from '@/components/TimelineRow/TimelineRow';
import { formatShortDate } from '@/lib/date';
import { ENTRY_TYPE, type EntryType } from '@/features/machines/records';
import type { HistoryEntry } from './data';
import { styles } from './styles';

type Filter = EntryType | 'all';
const FILTERS: Filter[] = ['all', 'repair', 'inspection', 'service'];

export type MachineHistoryProps = {
  entries: HistoryEntry[];
  onOpenEntry: (entry: HistoryEntry) => void;
};

/** M16 My machine history: everything you've logged, filterable by entry type. */
export function MachineHistory({ entries, onOpenEntry }: MachineHistoryProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const visible = filter === 'all' ? entries : entries.filter((e) => e.type === filter);

  return (
    <DetailScreen>
      <View style={styles.filters}>
        {FILTERS.map((f) => (
          <FilterChip
            key={f}
            label={f === 'all' ? 'All entries' : ENTRY_TYPE[f].plural}
            selected={filter === f}
            onPress={() => setFilter(f)}
          />
        ))}
      </View>

      {visible.length === 0 ? (
        <EmptyPanel
          icon={History}
          title={
            filter === 'all'
              ? 'Nothing logged yet'
              : `No ${ENTRY_TYPE[filter].plural.toLowerCase()} yet`
          }
          message="Repairs, inspections and services you log against a machine appear here."
        />
      ) : (
        <View style={styles.list}>
          {visible.map((entry, i) => (
            <TimelineRow
              key={entry.id}
              pill={ENTRY_TYPE[entry.type]}
              meta={formatShortDate(entry.at)}
              title={entry.title}
              detail={`${entry.machineId} · logged by ${entry.loggedBy}`}
              divider={i > 0}
              onPress={() => onOpenEntry(entry)}
            />
          ))}
        </View>
      )}
    </DetailScreen>
  );
}
