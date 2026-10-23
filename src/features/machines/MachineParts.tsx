import { ChevronRight, SearchX, Truck } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors, fontFamily, spacing } from '@/theme';
import { MACHINE_STATUS, type MachineRef, type MachineStatus } from './data';

/** Truck tile tinted by status, e.g. on a case, notification or fleet row. */
export function MachineIcon({ status, size = 40 }: { status: MachineStatus; size?: number }) {
  const tone = MACHINE_STATUS[status];
  return (
    <View
      style={[styles.icon, { width: size, height: size, backgroundColor: tone.bg }]}
      accessibilityElementsHidden
      importantForAccessibility="no"
    >
      <Truck size={20} color={tone.fg} strokeWidth={2} />
    </View>
  );
}

/** "HT-2201 · CAT 793F  [Down]  ›" link card. */
export function MachineCard({ machine, onPress }: { machine: MachineRef; onPress: () => void }) {
  const status = MACHINE_STATUS[machine.status];
  const name = `${machine.label} · ${machine.model}`;
  return (
    <BrandCard onPress={onPress} accessibilityLabel={`${name}, ${status.label}. View machine`}>
      <View style={styles.row}>
        <MachineIcon status={machine.status} size={36} />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Pill label={status.label} tone={status.tone} />
        <ChevronRight size={18} color={colors.inkSubtle} strokeWidth={2} />
      </View>
    </BrandCard>
  );
}

/** Shown when a machine link points at an asset that isn't in the fleet. */
export function MachineNotFound() {
  return (
    <DetailScreen>
      <EmptyPanel icon={SearchX} title="Machine not found" message="It may have left the fleet." />
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  icon: { borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { flex: 1, fontFamily: fontFamily.medium, fontSize: 16, lineHeight: 21 },
});
