import { SearchX, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Pill } from '@/components/Pill/Pill';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { formatHours } from '@/lib/format';
import { MACHINE_STATUS, searchMachines, type Machine } from './data';
import { MachineFilters, type Filters } from './MachineFilters';
import { MachineIcon } from './MachineParts';
import { scopeLine, SearchBar } from './MachineSearchBar';
import { styles } from './styles';

export type MachinesListProps = {
  machines: Machine[];
  /** The user's site; the list starts filtered to it ('all' when unknown). */
  homeSite: string;
  isSample?: boolean;
  /** First load in progress (no machines yet). */
  loading?: boolean;
  /** Load failed and nothing is cached: shown with a retry. */
  error?: unknown;
  onRetry?: () => void;
  onScan: () => void;
  /** Admins see the whole fleet and can add machines; technicians see their sites only. */
  isAdmin?: boolean;
  onAddMachine?: () => void;
  onNearMe: () => void;
  onOpenMachine: (id: string) => void;
};

/** M3 Machine search & filter (the Machines tab). */
export function MachinesList({
  machines,
  homeSite,
  isSample,
  isAdmin,
  onAddMachine,
  ...props
}: MachinesListProps) {
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
      <SearchBar
        query={query}
        onQuery={setQuery}
        topInset={insets.top}
        onScan={props.onScan}
        onAddMachine={isAdmin ? onAddMachine : undefined}
      />

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
        {machines.length > 0 && (
          <Text variant="caption" color="inkMuted">
            {scopeLine(machines, !!isAdmin)}
          </Text>
        )}
        <ListBody
          {...props}
          fleetSize={machines.length}
          visible={visible}
          showSite={filters.site === 'all'}
          onClearFilters={() => {
            setQuery('');
            setFilters({ site: 'all', make: 'all', status: 'all' });
          }}
        />
        {isSample && (
          <Text variant="caption" color="inkSubtle" style={styles.footnote}>
            Sample fleet — live machines arrive with the API.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

/** Loading, error, empty fleet, no matches, or the matching rows. */
function ListBody({
  loading,
  error,
  onRetry,
  fleetSize,
  visible,
  showSite,
  onClearFilters,
  onOpenMachine,
}: Pick<MachinesListProps, 'loading' | 'error' | 'onRetry' | 'onOpenMachine'> & {
  fleetSize: number;
  visible: Machine[];
  showSite: boolean;
  onClearFilters: () => void;
}) {
  if (loading) return <SkeletonList rows={5} />;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (fleetSize === 0) {
    return (
      <EmptyPanel
        icon={Truck}
        title="No machines yet"
        message="Machines added to your company's fleet will show here."
      />
    );
  }
  if (visible.length === 0) {
    return (
      <EmptyPanel
        icon={SearchX}
        title="No machines match"
        message="Try another search, or clear the filters to see the whole fleet."
        action={{ label: 'Clear filters', onPress: onClearFilters }}
      />
    );
  }
  return (
    <>
      {visible.map((m) => (
        <MachineRow
          key={m.id}
          machine={m}
          showSite={showSite}
          onPress={() => onOpenMachine(m.id)}
        />
      ))}
    </>
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
    <BrandCard onPress={onPress} accessibilityLabel={`${m.label}. ${caption}. ${status.label}`}>
      <View style={styles.row}>
        <MachineIcon status={m.status} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{m.label}</Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {caption}
          </Text>
        </View>
        <Pill label={status.label} tone={status.tone} />
      </View>
    </BrandCard>
  );
}
