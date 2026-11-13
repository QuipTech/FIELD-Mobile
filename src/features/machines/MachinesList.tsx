import { SearchX, Truck } from 'lucide-react-native';
import { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
import { Text } from '@/components/Text/Text';
import { useTabBarSpace } from '@/features/navigation/tabBarSpace';
import { spacing, useTheme } from '@/theme';
import { searchMachines, type Machine } from './data';
import { GroupFilter, type GroupOption } from './GroupFilter';
import { MachineFilters, type Filters } from './MachineFilters';
import { scopeLine, SearchBar } from './MachineSearchBar';
import { MachineRow } from './MachineRow';
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
  refreshing?: boolean;
  onRefresh?: () => void;
  onScan: () => void;
  /** Admins see the whole fleet and can add machines; technicians see their sites only. */
  isAdmin?: boolean;
  onAddMachine?: () => void;
  onNearMe: () => void;
  onOpenMachine: (id: string) => void;
  /** Machine groups shared with the user; a chip row filters by one (`GET /machines?groupId`). */
  groups?: GroupOption[];
  groupId?: string;
  onGroup?: (id?: string) => void;
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
  const { colors } = useTheme();
  const tabBar = useTabBarSpace();
  const [query, setQuery] = useState('');
  const initial: Filters = { site: homeSite, make: 'all', status: 'all' };
  const [filters, setFilters] = useState(initial);
  const update = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));

  const visible = filteredMachines(machines, query, filters);

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
        contentContainerStyle={[
          styles.content,
          { flexGrow: 1, paddingBottom: tabBar + spacing.md },
        ]}
        alwaysBounceVertical
        refreshControl={
          props.onRefresh ? (
            <RefreshControl
              refreshing={!!props.refreshing}
              onRefresh={props.onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          ) : undefined
        }
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {props.groups && props.onGroup && (
          <GroupFilter groups={props.groups} value={props.groupId} onChange={props.onGroup} />
        )}
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

function filteredMachines(machines: Machine[], query: string, filters: Filters) {
  return searchMachines(machines, query).filter(
    (m) =>
      (filters.site === 'all' || m.site === filters.site) &&
      (filters.make === 'all' || m.make === filters.make) &&
      (filters.status === 'all' || m.status === filters.status),
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
