import {
  ChevronRight,
  History,
  Layers,
  LifeBuoy,
  Settings2,
  type LucideIcon,
} from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { CaseCard } from '@/features/cases/CasesList';
import type { SupportCase } from '@/features/cases/data';
import { colors } from '@/theme';
import { ManualRow, type ManualActions } from './Manuals';
import type { ComponentGroup, MachineRecords } from './records';
import { styles } from './styles';
import { ConfigRows, HistoryRows } from './Timelines';

export type FullSection = 'history' | 'configuration' | 'manuals';
const PREVIEW = 3;

export type PanelProps = ManualActions & {
  records: MachineRecords;
  cases: SupportCase[];
  onOpenComponent: (id: string) => void;
  onSeeAll: (section: FullSection) => void;
  onOpenCase: (id: string) => void;
};

export function ComponentsPanel({
  groups,
  onOpen,
}: {
  groups: ComponentGroup[];
  onOpen: (id: string) => void;
}) {
  return (
    <View style={styles.panel}>
      {groups.map((g) => {
        const fault = g.issue?.tone === 'danger';
        const summary = g.issue?.label ?? `${g.count} components`;
        return (
          <BrandCard
            key={g.id}
            onPress={() => onOpen(g.id)}
            accessibilityLabel={`${g.name}, ${summary}`}
          >
            <View style={styles.row}>
              <View style={[styles.iconBox, fault && { backgroundColor: colors.dangerTint }]}>
                <Layers size={18} color={fault ? colors.danger : colors.ink} strokeWidth={2} />
              </View>
              <Text style={[styles.rowTitle, styles.rowText]}>{g.name}</Text>
              {g.issue ? (
                <Pill label={g.issue.label} tone={g.issue.tone} />
              ) : (
                <Text variant="caption" color="inkMuted">
                  {summary}
                </Text>
              )}
              <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
            </View>
          </BrandCard>
        );
      })}
    </View>
  );
}

function SeeAll({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.seeAll, pressed && styles.pressed]}
      accessibilityRole="link"
    >
      <Text variant="caption" color="brand" style={styles.seeAllText}>
        {label}
      </Text>
      <ChevronRight size={16} color={colors.brand} strokeWidth={2} />
    </Pressable>
  );
}

function Empty({ icon, title }: { icon: LucideIcon; title: string }) {
  return <EmptyPanel icon={icon} title={title} />;
}

export function HistoryPanel({ records, onSeeAll }: PanelProps) {
  const { history } = records;
  if (history.length === 0) return <Empty icon={History} title="No history logged yet" />;
  return (
    <View>
      <HistoryRows entries={history.slice(0, PREVIEW)} />
      <SeeAll label={`View full history (${history.length})`} onPress={() => onSeeAll('history')} />
    </View>
  );
}

export function ConfigurationPanel({ records, onSeeAll }: PanelProps) {
  const { configuration } = records;
  if (configuration.length === 0)
    return <Empty icon={Settings2} title="No configuration changes" />;
  return (
    <View>
      <ConfigRows changes={configuration.slice(0, PREVIEW)} />
      <SeeAll
        label={`View all changes (${configuration.length})`}
        onPress={() => onSeeAll('configuration')}
      />
    </View>
  );
}

export function ManualsPanel({ records, onSeeAll, onOpenManual, onDownloadManual }: PanelProps) {
  const { manuals } = records;
  return (
    <View style={styles.panel}>
      {manuals.slice(0, PREVIEW).map((m) => (
        <ManualRow
          key={m.id}
          manual={m}
          onOpenManual={onOpenManual}
          onDownloadManual={onDownloadManual}
        />
      ))}
      <SeeAll label="Search all manuals" onPress={() => onSeeAll('manuals')} />
    </View>
  );
}

export function CasesPanel({ cases, onOpenCase }: PanelProps) {
  if (cases.length === 0) return <Empty icon={LifeBuoy} title="No cases for this machine" />;
  return (
    <View style={styles.panel}>
      {cases.map((c) => (
        <CaseCard key={c.id} item={c} onPress={() => onOpenCase(c.id)} />
      ))}
    </View>
  );
}
