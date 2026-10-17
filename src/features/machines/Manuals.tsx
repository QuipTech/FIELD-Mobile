import { Check, Download, FileSearch } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Pill } from '@/components/Pill/Pill';
import { SearchField } from '@/components/SearchField/SearchField';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import { MANUAL_KIND, type MachineManual } from './records';
import { styles } from './styles';

export type ManualActions = {
  onOpenManual: (manual: MachineManual) => void;
  onDownloadManual: (manual: MachineManual) => void;
};

/** One document: type icon, title, revision, then "Offline" or a download button. */
export function ManualRow({
  manual,
  onOpenManual,
  onDownloadManual,
}: { manual: MachineManual } & ManualActions) {
  const kind = MANUAL_KIND[manual.kind];
  const Icon = kind.icon;
  return (
    <BrandCard
      onPress={() => onOpenManual(manual)}
      accessibilityLabel={`${manual.title}. ${manual.meta}${manual.offline ? '. Available offline' : ''}`}
    >
      <View style={styles.row}>
        <View style={[styles.iconBox, kind.warn && { backgroundColor: colors.amberTint }]}>
          <Icon size={18} color={kind.warn ? colors.amber : colors.ink} strokeWidth={2} />
        </View>
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{manual.title}</Text>
          <Text variant="caption" color="inkMuted">
            {manual.meta}
          </Text>
        </View>
        {manual.offline ? (
          <Pill label="Offline" tone="brand" icon={Check} />
        ) : (
          <Pressable
            onPress={() => onDownloadManual(manual)}
            style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Download ${manual.title} for offline use`}
          >
            <Download size={20} color={colors.inkMuted} strokeWidth={2} />
          </Pressable>
        )}
      </View>
    </BrandCard>
  );
}

/** Case-insensitive match on title and revision line. */
export function searchManuals(manuals: MachineManual[], query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return manuals;
  return manuals.filter((m) => `${m.title} ${m.meta}`.toLowerCase().includes(q));
}

/** M5.6 Manuals: every document for one machine, searchable. */
export function MachineManuals({
  manuals,
  ...actions
}: { manuals: MachineManual[] } & ManualActions) {
  const [query, setQuery] = useState('');
  const visible = searchManuals(manuals, query);
  return (
    <DetailScreen>
      <SearchField value={query} onChange={setQuery} label="Search manuals" />
      {visible.length === 0 ? (
        <EmptyPanel
          icon={FileSearch}
          title={query ? 'No documents match' : 'No documents yet'}
          message={query ? 'Try a part name, procedure or bulletin number.' : undefined}
        />
      ) : (
        visible.map((m) => <ManualRow key={m.id} manual={m} {...actions} />)
      )}
    </DetailScreen>
  );
}
