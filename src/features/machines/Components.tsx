import { Layers } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { DetailScreen } from '@/components/DetailScreen/DetailScreen';
import { EmptyPanel } from '@/components/EmptyPanel/EmptyPanel';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatShortDate } from '@/lib/date';
import { colors, spacing } from '@/theme';
import type { MachineComponent } from './records';
import { styles as shared } from './styles';

const hours = (h: number) => `${h.toLocaleString('en-AU')} h`;

/** The facts a component has recorded, in display order; the API leaves most of them null. */
function factsOf(c: MachineComponent): [string, string][] {
  const facts: [string, string | undefined][] = [
    ['Serial', c.serialNumber],
    ['Part number', c.partNumber],
    ['Manufacturer', c.manufacturer],
    ['Hours since install', c.hoursSinceInstall != null ? hours(c.hoursSinceInstall) : undefined],
    ['Last serviced', c.lastServicedAt && formatShortDate(c.lastServicedAt)],
    ['Next service due', c.nextServiceDueHours != null ? hours(c.nextServiceDueHours) : undefined],
    ['Installed', c.installedAt && formatShortDate(c.installedAt)],
    ['Hours at install', c.hoursAtInstall != null ? hours(c.hoursAtInstall) : undefined],
  ];
  return facts.filter((f): f is [string, string] => !!f[1]);
}

function ComponentCard({ component: c }: { component: MachineComponent }) {
  const facts = factsOf(c);
  const fault = c.issue?.tone === 'danger';
  return (
    <BrandCard>
      <View style={styles.card}>
        <View style={shared.row}>
          <View style={[shared.iconBox, fault && { backgroundColor: colors.dangerTint }]}>
            <Layers size={18} color={fault ? colors.danger : colors.ink} strokeWidth={2} />
          </View>
          <View style={shared.rowText}>
            <Text style={shared.rowTitle}>{c.name}</Text>
            {c.caption && (
              <Text variant="caption" color="inkMuted">
                {c.caption}
              </Text>
            )}
          </View>
          {c.issue && <Pill label={c.issue.label} tone={c.issue.tone} />}
        </View>
        {facts.length > 0 && (
          <View style={styles.facts}>
            {facts.map(([label, value]) => (
              <View key={label} style={styles.fact}>
                <Text variant="caption" color="inkMuted">
                  {label}
                </Text>
                <Text variant="caption">{value}</Text>
              </View>
            ))}
          </View>
        )}
        {c.notes && <Text variant="caption">{c.notes}</Text>}
      </View>
    </BrandCard>
  );
}

/** M4 drill-down: every component in one system (e.g. Powertrain) with what's recorded on it. */
export function SystemComponents({ components }: { components: MachineComponent[] }) {
  return (
    <DetailScreen>
      {components.length === 0 ? (
        <EmptyPanel
          icon={Layers}
          title="No components"
          message="Components recorded in this system appear here."
        />
      ) : (
        components.map((c) => <ComponentCard key={c.id} component={c} />)
      )}
    </DetailScreen>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  facts: {
    gap: spacing.xxs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  fact: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm },
});
