import { View } from 'react-native';

import { BrandCard } from '@/components/BrandCard/BrandCard';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatHours } from '@/lib/format';
import { LIFECYCLE, MACHINE_STATUS, type Machine } from './data';
import { GroupTag } from './GroupFilter';
import { MachineThumb } from './MachineThumb';
import { styles } from './styles';

/** One machine in the list: photo, label, model / place / hours, lifecycle and group tags. */
export function MachineRow({
  machine: m,
  showSite,
  onPress,
}: {
  machine: Machine;
  showSite: boolean;
  onPress: () => void;
}) {
  const status = MACHINE_STATUS[m.status];
  const life = m.lifecycle ? LIFECYCLE[m.lifecycle] : undefined;
  const place = showSite ? m.site : m.bench;
  const caption = [m.model, place, m.hours !== undefined ? formatHours(m.hours) : undefined]
    .filter(Boolean)
    .join(' · ');
  const groups = m.groups ?? [];
  return (
    <BrandCard
      onPress={onPress}
      accessibilityLabel={[
        m.label,
        caption,
        life?.label,
        status.label,
        ...groups.map((g) => g.name),
      ]
        .filter(Boolean)
        .join('. ')}
    >
      <View style={styles.row}>
        <MachineThumb photoUrl={m.photoUrl} status={m.status} lifecycle={m.lifecycle} />
        <View style={styles.rowText}>
          <Text style={styles.rowTitle}>{m.label}</Text>
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {caption}
          </Text>
          {(life?.tag || groups.length > 0) && (
            <View style={[styles.tagRow, { flexWrap: 'wrap', gap: 6 }]}>
              {life?.tag && <Pill label={life.label} tone={life.tag} />}
              {groups.map((g) => (
                <GroupTag key={g.id} name={g.name} colour={g.colour} />
              ))}
            </View>
          )}
        </View>
        <Pill label={status.label} tone={status.tone} />
      </View>
    </BrandCard>
  );
}
