import { Truck, Wrench } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import Svg, { Polyline } from 'react-native-svg';

import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { AssignedMachine, HomeData, MachineStatus, RecentEntry } from './data';
import { styles } from './styles';

const CHART_HEIGHT = 56;

/** Fleet uptime card with a sparkline scaled to the weekly values' range. */
export function UptimeCard({ uptime }: { uptime: HomeData['uptime'] }) {
  const [width, setWidth] = useState(0);
  const { weekly } = uptime;
  const min = Math.min(...weekly);
  const span = Math.max(...weekly) - min || 1;
  const pad = 4; // keep the 2.5px stroke inside the box
  const points = weekly
    .map((v, i) => {
      const x = (i / Math.max(weekly.length - 1, 1)) * width;
      const y = pad + (1 - (v - min) / span) * (CHART_HEIGHT - pad * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`Fleet uptime ${uptime.percent}% over ${uptime.weeks} weeks`}
    >
      <View style={styles.baselineRow}>
        <Text style={styles.overline} color="inkMuted">
          Fleet uptime
        </Text>
        <Text variant="caption" color="inkMuted">
          {uptime.percent}% · {uptime.weeks} wks
        </Text>
      </View>
      <View style={{ height: CHART_HEIGHT }} onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && (
          <Svg width={width} height={CHART_HEIGHT}>
            <Polyline
              points={points}
              fill="none"
              stroke={colors.brand}
              strokeWidth={2.5}
              strokeLinejoin="round"
            />
          </Svg>
        )}
      </View>
    </View>
  );
}

const STATUS: Record<MachineStatus, { label: string; fg: string; bg: string; border: string }> = {
  down: { label: 'Down', fg: colors.danger, bg: colors.dangerTint, border: colors.dangerBorder },
  due: { label: 'Due', fg: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  ok: { label: 'OK', fg: colors.success, bg: colors.successBg, border: colors.successBg },
};

export function AssignedCard({ item, onPress }: { item: AssignedMachine; onPress: () => void }) {
  const tone = STATUS[item.status];
  return (
    <Pressable
      onPress={onPress}
      style={styles.card}
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.detail}. ${tone.label}`}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, { backgroundColor: tone.bg }]}>
          <Truck size={20} color={tone.fg} strokeWidth={2} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text variant="caption" color="inkMuted">
            {item.detail}
          </Text>
        </View>
        <View style={[styles.tag, { backgroundColor: tone.bg, borderColor: tone.border }]}>
          <Text variant="caption" style={{ color: tone.fg }}>
            {tone.label}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function RecentCard({ item }: { item: RecentEntry }) {
  return (
    <View style={styles.card} accessible accessibilityLabel={`${item.title}. ${item.detail}`}>
      <View style={styles.cardRow}>
        <View style={styles.iconBox}>
          <Wrench size={20} color={colors.inkMuted} strokeWidth={2} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.itemTitle}>{item.title}</Text>
          <Text variant="caption" color="inkMuted">
            {item.detail}
          </Text>
        </View>
      </View>
    </View>
  );
}
