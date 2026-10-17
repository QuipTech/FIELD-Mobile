import type { LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { colors } from '@/theme';
import { Text } from '../Text/Text';
import { styles } from './styles';

export type PillTone = 'neutral' | 'muted' | 'brand' | 'amber' | 'danger' | 'success';

const TONES: Record<PillTone, { fg: string; bg: string; border: string }> = {
  neutral: { fg: colors.inkMuted, bg: colors.surface, border: colors.control },
  muted: { fg: colors.inkMuted, bg: colors.fill, border: colors.control },
  brand: { fg: colors.brand, bg: colors.brandTint, border: colors.brandTintStrong },
  amber: { fg: colors.amber, bg: colors.amberTint, border: colors.amberBorder },
  danger: { fg: colors.danger, bg: colors.dangerTint, border: colors.dangerBorder },
  success: { fg: colors.success, bg: colors.successBg, border: colors.successBg },
};

export type PillProps = { label: string; tone?: PillTone; icon?: LucideIcon };

/** Small rounded status / count / type chip from the M2+ designs, e.g. "Active", "P1", "Repair". */
export function Pill({ label, tone = 'neutral', icon: Icon }: PillProps) {
  const t = TONES[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg, borderColor: t.border }]}>
      {Icon && <Icon size={13} color={t.fg} strokeWidth={2} />}
      <Text variant="caption" style={[styles.label, { color: t.fg }]}>
        {label}
      </Text>
    </View>
  );
}
