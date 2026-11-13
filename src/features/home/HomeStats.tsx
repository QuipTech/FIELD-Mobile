import { AlertTriangle, FileText, LifeBuoy, type LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { colors, fontFamily } from '@/theme';
import type { HomeStats } from './data';

type Tone = { fg: string; bg: string; border: string };
const TONES = {
  amber: { fg: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  danger: { fg: colors.danger, bg: colors.dangerTint, border: colors.dangerBorder },
  brand: { fg: colors.brandDeep, bg: colors.brandTint, border: colors.brandTintStrong },
} satisfies Record<string, Tone>;

function casesCaption({ openCases: c }: HomeStats) {
  if (c.total === 0) return 'No open cases';
  return c.breachingSla > 0 ? `${c.breachingSla} breaching SLA` : 'None breaching SLA';
}

function downCaption({ machinesDown: d }: HomeStats) {
  if (d.total === 0) return 'Every machine is up';
  const names = d.labels.slice(0, 2).join(' · ');
  const more = d.total - Math.min(d.labels.length, 2);
  return more > 0 ? `${names}${names ? ' ' : ''}+${more} more` : names;
}

function Tile({
  label,
  value,
  caption,
  icon: Icon,
  tone,
  onPress,
}: {
  label: string;
  value: number;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${label}: ${value}. ${caption}`}
      style={({ pressed }) => [
        styles.tile,
        { backgroundColor: tone.bg, borderColor: tone.border },
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.top}>
        <Text style={[styles.value, { color: tone.fg }]}>{value.toLocaleString('en-AU')}</Text>
        <Icon size={18} color={tone.fg} strokeWidth={2} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {label}
      </Text>
      <Text variant="caption" color="inkMuted" numberOfLines={2} style={styles.caption}>
        {caption}
      </Text>
    </Pressable>
  );
}

/** Open cases, machines down and entries this week, like the web dashboard. */
export function HomeStatsRow({
  stats,
  onOpenCases,
  onOpenMachines,
}: {
  stats: HomeStats;
  onOpenCases: () => void;
  onOpenMachines: () => void;
}) {
  return (
    <View style={styles.row}>
      <Tile
        label="Open cases"
        value={stats.openCases.total}
        caption={casesCaption(stats)}
        icon={LifeBuoy}
        tone={TONES.amber}
        onPress={onOpenCases}
      />
      <Tile
        label="Machines down"
        value={stats.machinesDown.total}
        caption={downCaption(stats)}
        icon={AlertTriangle}
        tone={TONES.danger}
        onPress={onOpenMachines}
      />
      <Tile
        label="Entries this week"
        value={stats.entriesThisWeek.total}
        caption={`${stats.entriesThisWeek.mine} logged by you`}
        icon={FileText}
        tone={TONES.brand}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  tile: { flex: 1, borderWidth: 1, borderRadius: 14, padding: 12, gap: 2, minHeight: 112 },
  pressed: { opacity: 0.85 },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  value: { fontFamily: fontFamily.semibold, fontSize: 26, lineHeight: 31 },
  label: { fontFamily: fontFamily.medium, fontSize: 13, lineHeight: 17, color: colors.ink },
  caption: { fontSize: 11, lineHeight: 15 },
});
