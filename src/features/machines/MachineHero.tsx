import { Truck } from 'lucide-react-native';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatHours } from '@/lib/format';
import { colors } from '@/theme';
import type { Machine } from './data';
import { styles } from './styles';

/** Machine photo, or a violet placeholder until the asset register has one. */
export function MachineHero({ machine }: { machine: Machine }) {
  if (machine.photoUrl) {
    return (
      <Image
        source={{ uri: machine.photoUrl }}
        style={styles.heroImage}
        resizeMode="cover"
        accessibilityLabel={`Photo of ${machine.label}`}
      />
    );
  }
  return (
    <View style={styles.hero} accessibilityElementsHidden importantForAccessibility="no">
      <Svg style={StyleSheet.absoluteFill} preserveAspectRatio="none" viewBox="0 0 100 100">
        <Defs>
          <LinearGradient id="machineHero" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={colors.brand} />
            <Stop offset="0.6" stopColor={colors.brandDeep} />
            <Stop offset="1" stopColor={colors.brandNight} />
          </LinearGradient>
        </Defs>
        <Rect width="100" height="100" fill="url(#machineHero)" />
      </Svg>
      <Truck size={44} color={colors.onBrandMuted} strokeWidth={1.5} />
      <Text color="onAccent" style={styles.heroTitle}>
        {machine.model}
      </Text>
      <Text variant="caption" color="onBrandMuted">
        No photo yet
      </Text>
    </View>
  );
}

/** Model, hours, location and serial chips under the hero. */
export function SpecChips({ machine: m }: { machine: Machine }) {
  const specs = [
    m.model,
    m.hours !== undefined ? formatHours(m.hours) : undefined,
    [m.site, m.bench].filter(Boolean).join(' · '),
    `S/N ${m.serial}`,
  ].filter((s): s is string => !!s);
  return (
    <View style={styles.specs}>
      {specs.map((s) => (
        <Pill key={s} label={s} tone="muted" />
      ))}
    </View>
  );
}
