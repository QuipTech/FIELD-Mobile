import { History, Plus, Settings2 } from 'lucide-react-native';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import type { FilterOption } from '@/components/FilterChip/FilterChip';
import { TimelineRow } from '@/components/TimelineRow/TimelineRow';
import { formatShortDate } from '@/lib/date';
import { colors } from '@/theme';
import {
  CONFIG_KIND,
  ENTRY_TYPE,
  type ConfigChange,
  type EntryType,
  type TimelineEntry,
} from './records';

export type HistoryFilter = EntryType | 'all';
export const HISTORY_FILTERS: FilterOption<HistoryFilter>[] = [
  { value: 'all', label: 'All entries' },
  ...(Object.keys(ENTRY_TYPE) as EntryType[]).map((t) => ({
    value: t,
    label: ENTRY_TYPE[t].plural,
  })),
];

/** Timeline rows for maintenance history; shared by M5 and the M4 History tab. */
export function HistoryRows({
  entries,
  onOpenPhoto,
}: {
  entries: TimelineEntry[];
  onOpenPhoto?: (entry: TimelineEntry, index: number) => void;
}) {
  return (
    <View>
      {entries.map((e, i) => (
        <TimelineRow
          key={e.id}
          pill={ENTRY_TYPE[e.type]}
          meta={`${formatShortDate(e.at)} · ${e.by}`}
          title={e.title}
          detail={e.detail}
          photos={e.photos}
          photoUris={e.photoUris}
          divider={i > 0}
          onOpenPhoto={onOpenPhoto && ((index) => onOpenPhoto(e, index))}
        />
      ))}
    </View>
  );
}

/** Timeline rows for configuration changes; shared by M5.5 and the M4 Configuration tab. */
export function ConfigRows({ changes }: { changes: ConfigChange[] }) {
  return (
    <View>
      {changes.map((c, i) => (
        <TimelineRow
          key={c.id}
          pill={CONFIG_KIND[c.kind]}
          meta={formatShortDate(c.at)}
          title={c.title}
          detail={c.detail}
          divider={i > 0}
        />
      ))}
    </View>
  );
}

export type MachineTimelineProps = {
  entries: TimelineEntry[];
  filter: HistoryFilter;
  onAddEntry: () => void;
  onOpenPhoto: (entry: TimelineEntry, index: number) => void;
};

/** M5 History timeline for one machine. The Filter control lives in the header (see route). */
export function MachineTimeline({
  entries,
  filter,
  onAddEntry,
  onOpenPhoto,
}: MachineTimelineProps) {
  const visible = filter === 'all' ? entries : entries.filter((e) => e.type === filter);
  return (
    <DetailScreen
      footer={
        <BrandButton
          label="Add entry"
          icon={<Plus size={18} color={colors.onAccent} strokeWidth={2.25} />}
          onPress={onAddEntry}
        />
      }
    >
      {visible.length === 0 ? (
        <EmptyPanel
          icon={History}
          title={
            filter === 'all' ? 'No history yet' : `No ${ENTRY_TYPE[filter].plural.toLowerCase()}`
          }
          message="Repairs, inspections, faults and services logged on this machine appear here."
        />
      ) : (
        <HistoryRows entries={visible} onOpenPhoto={onOpenPhoto} />
      )}
    </DetailScreen>
  );
}

/** M5.5 Configuration history: part swaps, firmware and bulletins applied. */
export function ConfigurationTimeline({ changes }: { changes: ConfigChange[] }) {
  return (
    <DetailScreen>
      {changes.length === 0 ? (
        <EmptyPanel
          icon={Settings2}
          title="No configuration changes"
          message="Part swaps, firmware updates and bulletins applied to this machine appear here."
        />
      ) : (
        <ConfigRows changes={changes} />
      )}
    </DetailScreen>
  );
}
