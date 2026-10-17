import { Plus, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { SegmentedTabs, type SegmentOption } from '@/components/SegmentedTabs/SegmentedTabs';
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
import { MachineHero, SpecChips } from './MachineHero';
import { styles } from './styles';

export type MachineTab = 'components' | 'history' | 'configuration' | 'manuals' | 'cases';

const TABS: SegmentOption<MachineTab>[] = [
  { value: 'components', label: 'Components' },
  { value: 'history', label: 'History' },
  { value: 'configuration', label: 'Configuration' },
  { value: 'manuals', label: 'Manuals' },
  { value: 'cases', label: 'Cases' },
];

export type MachineDetailProps = PanelProps & {
  machine: Machine;
  onAskAi: () => void;
  onLogEntry: () => void;
};

/** M4 Machine detail: photo, specs, then components, history, configuration, manuals and cases. */
export function MachineDetail({ machine, onAskAi, onLogEntry, ...panel }: MachineDetailProps) {
  const [tab, setTab] = useState<MachineTab>('components');
  const tabs = TABS.map((t) => (t.value === 'cases' ? { ...t, count: panel.cases.length } : t));

  return (
    <DetailScreen
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
      <SpecChips machine={machine} />
      <SegmentedTabs options={tabs} value={tab} onChange={setTab} />
      {tab === 'components' && (
        <ComponentsPanel groups={panel.records.components} onOpen={panel.onOpenComponent} />
      )}
      {tab === 'history' && <HistoryPanel {...panel} />}
      {tab === 'configuration' && <ConfigurationPanel {...panel} />}
      {tab === 'manuals' && <ManualsPanel {...panel} />}
      {tab === 'cases' && <CasesPanel {...panel} />}
    </DetailScreen>
  );
}
