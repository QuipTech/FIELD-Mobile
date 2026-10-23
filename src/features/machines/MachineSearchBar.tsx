import { Plus, ScanLine } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { SearchField } from '@/components/SearchField/SearchField';
import { colors } from '@/theme';
import type { Machine } from './data';
import { styles } from './styles';

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
      <SearchField value={query} onChange={onQuery} label="Search assets" style={styles.search} />
      <Pressable
        onPress={onScan}
        style={({ pressed }) => [styles.scan, pressed && styles.scanPressed]}
        accessibilityRole="button"
        accessibilityLabel="Scan asset tag"
      >
        <ScanLine size={22} color={colors.onAccent} strokeWidth={2} />
      </Pressable>
      {onAddMachine && (
        <Pressable
          onPress={onAddMachine}
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Add machine"
        >
          <Plus size={22} color={colors.ink} strokeWidth={2} />
        </Pressable>
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
