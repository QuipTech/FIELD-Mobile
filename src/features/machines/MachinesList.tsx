import { ScanLine, SearchX } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Pill } from '@/components/Pill/Pill';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { formatHours } from '@/lib/format';
import { colors } from '@/theme';
import { MACHINE_STATUS, searchMachines, type Machine } from './data';
import { MachineFilters, type Filters } from './MachineFilters';
import { MachineIcon } from './MachineParts';
import { styles } from './styles';

export type MachinesListProps = {
  machines: Machine[];
  /** The user's site; the list starts filtered to it. */
  homeSite: string;
  isSample?: boolean;
  onScan: () => void;
  onNearMe: () => void;
  onOpenMachine: (id: string) => void;
};

/** M3 Machine search & filter (the Machines tab). */
export function MachinesList({ machines, homeSite, isSample, ...props }: MachinesListProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const initial: Filters = { site: homeSite, make: 'all', status: 'all' };
  const [filters, setFilters] = useState(initial);
  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const visible = searchMachines(machines, query).filter(
    (m) =>
      (filters.site === 'all' || m.site === filters.site) &&
      (filters.make === 'all' || m.make === filters.make) &&
      (filters.status === 'all' || m.status === filters.status),
  );

  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <View style={[styles.searchBar, { paddingTop: insets.top + 8 }]}>
        <SearchField
          value={query}
          onChange={setQuery}
          label="Search assets"
          style={styles.search}
        />
        <Pressable
          onPress={props.onScan}
          style={({ pressed }) => [styles.scan, pressed && styles.scanPressed]}
          accessibilityRole="button"
          accessibilityLabel="Scan asset tag"
        >
          <ScanLine size={22} color={colors.onAccent} strokeWidth={2} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <MachineFilters
          machines={machines}
          filters={filters}
          onChange={update}
          onNearMe={props.onNearMe}
        />
        {visible.length === 0 ? (
          <EmptyPanel
            icon={SearchX}
            title="No machines match"
            message="Try another search, or clear the filters to see the whole fleet."
            action={{
              label: 'Clear filters',
              onPress: () => {
                setQuery('');
                setFilters({ site: 'all', make: 'all', status: 'all' });
              },
            }}
          />
        ) : (
          visible.map((m) => (
            <MachineRow
              key={m.id}
              machine={m}
              showSite={filters.site === 'all'}
              onPress={() => props.onOpenMachine(m.id)}
            />
          ))
        )}
        {isSample && (
          <Text variant="caption" color="inkSubtle" style={styles.footnote}>
            Sample fleet — live machines arrive with the API.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

function MachineRow({
  machine: m,
  showSite,
  onPress,
}: {
  machine: Machine;
  showSite: boolean;
  onPress: () => void;
}) {
  const status = MACHINE_STATUS[m.status];
  const place = showSite ? m.site : m.bench;
  const caption = [m.model, place, m.hours !== undefined ? formatHours(m.hours) : undefined]
    .filter(Boolean)
    .join(' · ');
  return (
    <BrandCard onPress={onPress} accessibilityLabel={`${m.id}. ${caption}. ${status.label}`}>
      <View style={styles.row}>
        <MachineIcon status={m.status} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{m.id}</Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {caption}
          </Text>
        </View>
        <Pill label={status.label} tone={status.tone} />
      </View>
    </BrandCard>
  );
}
