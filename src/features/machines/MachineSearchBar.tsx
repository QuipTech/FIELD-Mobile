import { Plus } from 'lucide-react-native';
import { View } from 'react-native';

import { PressableScale } from '@/components/PressableScale/PressableScale';
import { SearchField } from '@/components/SearchField/SearchField';
import { DrawerMenuButton } from '@/features/navigation/DrawerMenu';
import { colors } from '@/theme';
import type { Machine } from './data';
import { styles } from './styles';
import { AnimatedScanIcon } from './AnimatedScanIcon';

/** Search field, scan button and (admins only) the add-machine button. */
export function SearchBar({
  query,
  onQuery,
  topInset,
  onScan,
  onAddMachine,
}: {
  query: string;
  onQuery: (q: string) => void;
  topInset: number;
  onScan: () => void;
  onAddMachine?: () => void;
}) {
  return (
    <View style={[styles.searchBar, { paddingTop: topInset + 8 }]}>
      <DrawerMenuButton />
      <SearchField value={query} onChange={onQuery} label="Search assets" style={styles.search} />
      <PressableScale
        onPress={onScan}
        style={({ pressed }) => [styles.scan, pressed && styles.scanPressed]}
        accessibilityRole="button"
        accessibilityLabel="Scan asset tag"
      >
        <AnimatedScanIcon />
      </PressableScale>
      {onAddMachine && (
        <PressableScale
          onPress={onAddMachine}
          style={({ pressed }) => [styles.add, pressed && styles.addPressed]}
          accessibilityRole="button"
          accessibilityLabel="Add machine"
        >
          <Plus size={25} color={colors.brand} strokeWidth={2.2} />
        </PressableScale>
      )}
    </View>
  );
}

/** Says whose machines these are: all sites for admins, the user's own sites otherwise. */
export function scopeLine(machines: Machine[], isAdmin: boolean) {
  if (isAdmin) return `All sites · ${machines.length} machine${machines.length === 1 ? '' : 's'}`;
  const sites = [...new Set(machines.map((m) => m.site).filter(Boolean))];
  return sites.length ? `Machines at your sites · ${sites.join(', ')}` : 'Machines at your sites';
}
