import { Plus, Sparkles } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { SegmentedTabs, type SegmentOption } from '@/components/SegmentedTabs/SegmentedTabs';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { Machine } from './data';
import {
  CasesPanel,
  ComponentsPanel,
  ConfigurationPanel,
  HistoryPanel,
  ManualsPanel,
  type PanelProps,
} from './DetailPanels';
import { DocumentsPanel } from './DocumentsPanel';
import { MachineAppPanel } from './MachineAppPanel';
import { MachineFacts } from './MachineFacts';
import { MachineHero } from './MachineHero';
import { styles } from './styles';

export type MachineTab =
  'components' | 'history' | 'documents' | 'app' | 'configuration' | 'manuals' | 'cases';

const TABS: SegmentOption<MachineTab>[] = [
  { value: 'components', label: 'Components' },
  { value: 'history', label: 'History' },
  { value: 'documents', label: 'Documents' },
  { value: 'app', label: 'Machine app' },
  { value: 'configuration', label: 'Configuration' },
  { value: 'manuals', label: 'Manuals' },
  { value: 'cases', label: 'Cases' },
];

export type MachineDetailProps = PanelProps & {
  machine: Machine;
  onAskAi: () => void;
  onLogEntry: () => void;
  /** Admins also see how many technicians work on the machine. */
  isAdmin?: boolean;
  technicians?: number;
  /** Lifecycle and billing card, under the details (rendered by the route). */
  lifecycle?: ReactNode;
  /** `history.create` on a machine that isn't sold. */
  canUploadDocuments?: boolean;
  /** `machine.manage`: pair / disconnect the tablet. */
  canManage?: boolean;
  onRefresh?: () => void;
  refreshing?: boolean;
};

/** M4 Machine detail: photo, specs, then components, history, configuration, manuals and cases. */
export function MachineDetail({
  machine,
  onAskAi,
  onLogEntry,
  isAdmin,
  technicians,
  lifecycle,
  canUploadDocuments = false,
  canManage = false,
  onRefresh,
  refreshing,
  ...panel
}: MachineDetailProps) {
  const [tab, setTab] = useState<MachineTab>('components');
  const tabs = TABS.map((t) => (t.value === 'cases' ? { ...t, count: panel.cases.length } : t));

  return (
    <DetailScreen
      onRefresh={onRefresh}
      refreshing={refreshing}
      footer={
        <View style={styles.actions}>
          <BrandButton
            label="Ask AI"
            icon={<Sparkles size={18} color={colors.onAccent} strokeWidth={2} />}
            onPress={onAskAi}
            style={styles.action}
          />
          <BrandButton
            variant="outline"
            label="Log entry"
            icon={<Plus size={18} color={colors.ink} strokeWidth={2} />}
            onPress={onLogEntry}
            style={styles.action}
          />
        </View>
      }
    >
      <MachineHero machine={machine} />
      <MachineFacts machine={machine} />
      {lifecycle}
      {isAdmin && technicians !== undefined && (
        <Text variant="caption" color="inkMuted" style={styles.assigned}>
          {technicians} technician{technicians === 1 ? '' : 's'} assigned
        </Text>
      )}
      <SegmentedTabs options={tabs} value={tab} onChange={setTab} />
      {tab === 'components' && (
        <ComponentsPanel groups={panel.records.components} onOpen={panel.onOpenComponent} />
      )}
      {tab === 'history' && <HistoryPanel {...panel} />}
      {tab === 'documents' && (
        <DocumentsPanel machineId={machine.id} canUpload={canUploadDocuments} />
      )}
      {tab === 'app' && <MachineAppPanel machineId={machine.id} canManage={canManage} />}
      {tab === 'configuration' && <ConfigurationPanel {...panel} />}
      {tab === 'manuals' && <ManualsPanel {...panel} />}
      {tab === 'cases' && <CasesPanel {...panel} />}
    </DetailScreen>
  );
}
