import { LifeBuoy, Plus } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { BrandCard } from '@/components/BrandCard/BrandCard';
import { Chip } from '@/components/Chip/Chip';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { ErrorState } from '@/components/ErrorState/ErrorState';
import { FilterSelect, type FilterOption } from '@/components/FilterChip/FilterChip';
import { APP_MESH, MeshBackground } from '@/components/MeshBackground/MeshBackground';
import { Pill } from '@/components/Pill/Pill';
import { SkeletonList } from '@/components/Skeleton/SkeletonList';
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

type AdminFilter = 'all' | 'unassigned' | 'breaching';
const ADMIN_MATCH: Record<AdminFilter, (c: SupportCase) => boolean> = {
  all: () => true,
  unassigned: (c) => c.assignee === null,
  breaching: (c) => !!c.slaBreaching,
};

export type CasesListProps = {
  cases: SupportCase[];
  /** Admins get triage chips and see who each case is assigned to. */
  isAdmin?: boolean;
  loading?: boolean;
  /** Shown instead of the list when there's nothing cached to show. */
  error?: unknown;
  onRetry?: () => void;
  onNewCase: () => void;
  onOpenCase: (id: string) => void;
};

/** M11 Support / open cases (the Cases tab). */
export function CasesList({ cases, isAdmin, onNewCase, onOpenCase, ...state }: CasesListProps) {
  const [status, setStatus] = useState<StatusFilter>('open');
  const [machine, setMachine] = useState('all');
  const [triage, setTriage] = useState<AdminFilter>('all');

  const machineOptions = useMemo(() => {
    const byId = new Map(
      cases.flatMap((c) => (c.machine ? [[c.machine.id, c.machine.label]] : [])),
    );
    return [
      { value: 'all', label: 'All machines' },
      ...[...byId]
        .sort(([, a], [, b]) => a.localeCompare(b))
        .map(([id, label]) => ({ value: id, label })),
    ];
  }, [cases]);

  const visible = cases.filter(
    (c) =>
      (status === 'all' || c.status === status) &&
      (machine === 'all' || c.machine?.id === machine) &&
      (!isAdmin || ADMIN_MATCH[triage](c)),
  );
  const unassigned = cases.filter(
    (c) => (status === 'all' || c.status === status) && c.assignee === null,
  ).length;

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
        {isAdmin && <TriageChips value={triage} unassigned={unassigned} onChange={setTriage} />}

        {state.loading ? (
          <SkeletonList rows={4} />
        ) : state.error ? (
          <ErrorState error={state.error} onRetry={state.onRetry} />
        ) : visible.length === 0 ? (
          <EmptyPanel
            icon={LifeBuoy}
            title={status === 'open' ? 'No open cases' : 'No cases match'}
            message="Tap New to raise a case with QuipTech support."
          />
        ) : (
          visible.map((c) => (
            <CaseCard key={c.id} item={c} isAdmin={isAdmin} onPress={() => onOpenCase(c.id)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function TriageChips({
  value,
  unassigned,
  onChange,
}: {
  value: AdminFilter;
  unassigned: number;
  onChange: (next: AdminFilter) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.filters}>
        <Chip label="All sites" selected={value === 'all'} onPress={() => onChange('all')} />
        <Chip
          label="Unassigned"
          count={unassigned}
          selected={value === 'unassigned'}
          onPress={() => onChange('unassigned')}
        />
        <Chip
          label="Breaching SLA"
          selected={value === 'breaching'}
          onPress={() => onChange('breaching')}
        />
      </View>
    </ScrollView>
  );
}

const assigneeLine = (item: SupportCase) =>
  item.assignee === null ? 'Unassigned' : item.assignee ? `Assigned to ${item.assignee}` : '';

export function CaseCard({
  item,
  isAdmin,
  onPress,
}: {
  item: SupportCase;
  isAdmin?: boolean;
  onPress: () => void;
}) {
  const updated = formatRelative(item.updatedAt);
  const assignee = isAdmin ? assigneeLine(item) : '';
  const subtitle = [item.machine?.label, item.summary].filter(Boolean).join(' · ');
  return (
    <BrandCard
      onPress={onPress}
      accessibilityLabel={`${item.priority}, case ${item.id}: ${item.title}. ${subtitle}. Updated ${updated}${assignee ? `. ${assignee}` : ''}`}
    >
      <View style={styles.splitRow}>
        <Pill label={item.priority} tone={PRIORITY_TONE[item.priority]} />
        <Text variant="caption" color="inkSubtle">
          #{item.id} · {updated}
        </Text>
      </View>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text variant="caption" color="inkMuted">
        {subtitle}
      </Text>
      {item.slaBreaching && isAdmin && (
        <Text variant="caption" style={styles.breaching}>
          Close to SLA breach
        </Text>
      )}
      {!!assignee && (
        <Text variant="caption" color="inkSubtle">
          {assignee}
        </Text>
      )}
    </BrandCard>
  );
}
