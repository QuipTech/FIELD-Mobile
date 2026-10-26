// TODO(near-me): restore with the Near me chip below.
// import { MapPin } from 'lucide-react-native';
import { useMemo } from 'react';
import { ScrollView } from 'react-native';

import { FilterChip, FilterSelect, type FilterOption } from '@/components/FilterChip/FilterChip';
import type { Machine, MachineStatus } from './data';
import { styles } from './styles';

export type Filters = { site: string; make: string; status: MachineStatus | 'all' };

const STATUS_OPTIONS: FilterOption<Filters['status']>[] = [
  { value: 'all', label: 'Any status' },
  { value: 'down', label: 'Down' },
  { value: 'due', label: 'Service due' },
  { value: 'ok', label: 'Running' },
];

/** M3 filter row: site (removable), make and status. Near me is hidden for now. */
export function MachineFilters({
  machines,
  filters,
  onChange,
  // onNearMe,
}: {
  machines: Machine[];
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onNearMe: () => void;
}) {
  const { sites, makes } = useMemo(() => {
    const options = (values: string[], all: string) => [
      { value: 'all', label: all },
      ...[...new Set(values)].sort().map((v) => ({ value: v, label: v })),
    ];
    return {
      sites: options(
        machines.map((m) => m.site),
        'All sites',
      ),
      makes: options(
        machines.map((m) => m.make),
        'Any make',
      ),
    };
  }, [machines]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filters}
    >
      {filters.site === 'all' ? (
        <FilterSelect
          title="Site"
          value={filters.site}
          options={sites}
          onChange={(site) => onChange({ site })}
          allValue="all"
          placeholder="Site"
        />
      ) : (
        <FilterChip
          label={filters.site}
          selected
          removable
          onPress={() => onChange({ site: 'all' })}
          accessibilityLabel={`Site: ${filters.site}. Remove filter`}
        />
      )}
      <FilterSelect
        title="Make"
        value={filters.make}
        options={makes}
        onChange={(make) => onChange({ make })}
        allValue="all"
        placeholder="Make"
      />
      <FilterSelect
        title="Status"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) => onChange({ status })}
        allValue="all"
        placeholder="Status"
      />
      {/* TODO(near-me): hidden until sorting by distance is built.
      <FilterChip label="Near me" icon={MapPin} onPress={onNearMe} /> */}
    </ScrollView>
  );
}
