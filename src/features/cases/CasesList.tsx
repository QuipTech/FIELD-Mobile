import { LifeBuoy, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { FilterSelect, type FilterOption } from '@/components/FilterChip/FilterChip';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Pill } from '@/components/Pill/Pill';
import { TabHeader } from '@/components/TabHeader/TabHeader';
import { Text } from '@/components/Text/Text';
import { formatRelative } from '@/lib/date';
import { colors } from '@/theme';
import { PRIORITY_TONE, type CaseStatus, type SupportCase } from './data';
import { styles } from './styles';

type StatusFilter = CaseStatus | 'all';
const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
  { value: 'open', label: 'Open' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'all', label: 'All cases' },
];

export type CasesListProps = {
  cases: SupportCase[];
  /** Shows a small note while the list uses sample data. */
  isSample?: boolean;
  onNewCase: () => void;
  onOpenCase: (id: string) => void;
};

/** M11 Support / open cases (the Cases tab). */
export function CasesList({ cases, isSample, onNewCase, onOpenCase }: CasesListProps) {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [machine, setMachine] = useState('all');

  const machineOptions = useMemo(() => {
    const ids = [...new Set(cases.map((c) => c.machine.id))].sort();
    return [
      { value: 'all', label: 'All machines' },
      ...ids.map((id) => ({ value: id, label: id })),
    ];
  }, [cases]);

  const visible = cases.filter(
    (c) =>
      (status === 'all' || c.status === status) && (machine === 'all' || c.machine.id === machine),
  );

  return (
    <View style={styles.root}>
      <MeshBackground spots={APP_MESH} />
      <TabHeader
        title="Cases"
        right={
          <BrandButton
            label="New"
            icon={<Plus size={18} color={colors.onAccent} strokeWidth={2.25} />}
            onPress={onNewCase}
            style={styles.newButton}
          />
        }
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filters}>
          <FilterSelect
            title="Status"
            value={status}
            options={STATUS_OPTIONS}
            onChange={setStatus}
            allValue="all"
          />
          <FilterSelect
            title="Machine"
            value={machine}
            options={machineOptions}
            onChange={setMachine}
            allValue="all"
          />
        </View>

        {visible.length === 0 ? (
          <EmptyPanel
            icon={LifeBuoy}
            title={status === 'open' ? 'No open cases' : 'No cases match'}
            message="Tap New to raise a case with QuipTech support."
          />
        ) : (
          visible.map((c) => <CaseCard key={c.id} item={c} onPress={() => onOpenCase(c.id)} />)
        )}

        {isSample && (
          <Text variant="caption" color="inkSubtle" style={styles.footnote}>
            Sample cases — live cases arrive with the API.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

export function CaseCard({ item, onPress }: { item: SupportCase; onPress: () => void }) {
  const updated = formatRelative(item.updatedAt);
  return (
    <BrandCard
      onPress={onPress}
      accessibilityLabel={`${item.priority}, case ${item.id}: ${item.title}. ${item.machine.id}, ${item.summary}. Updated ${updated}`}
    >
      <View style={styles.splitRow}>
        <Pill label={item.priority} tone={PRIORITY_TONE[item.priority]} />
        <Text variant="caption" color="inkSubtle">
          #{item.id} · {updated}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text variant="caption" color="inkMuted">
        {item.machine.id} · {item.summary}
      </Text>
    </BrandCard>
  );
}
