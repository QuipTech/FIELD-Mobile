import { BookOpen, Database, Users, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { useTheme } from '@/theme';
import type { AdminOverview } from './overviewData';
import { styles } from './overviewStyles';
import { styles as home } from './styles';

const count = (n: number) => n.toLocaleString('en-AU');

function Stat({
  icon: Icon,
  value,
  label,
  tone,
}: {
  icon: LucideIcon;
  value: number;
  label: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const { colors: c } = useTheme();
  const tint =
    tone === 'primary' ? c.primaryTint : tone === 'success' ? c.successTint : c.warningTint;
  return (
    <View
      style={[home.card, styles.stat, { backgroundColor: c.card, borderColor: tint }]}
      accessible
      accessibilityLabel={`${count(value)} ${label}`}
    >
      <View pointerEvents="none" style={[styles.statAccent, { backgroundColor: tint }]} />
      <View style={[styles.statIcon, { backgroundColor: tint }]}>
        <Icon size={19} color={c[tone]} strokeWidth={2} />
      </View>
      <Text style={[styles.statValue, { color: c.ink }]} numberOfLines={1} adjustsFontSizeToFit>
        {count(value)}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={2} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

/** Active users, documents indexed and assets in the library (portal Overview). */
export function OverviewStats({ overview: o }: { overview: AdminOverview }) {
  return (
    <View style={home.row}>
      <Stat icon={Users} value={o.users.active} label="Active users" tone="primary" />
      <Stat icon={BookOpen} value={o.documents.indexed} label="Documents indexed" tone="success" />
      <Stat icon={Database} value={o.assets.total} label="Assets in library" tone="warning" />
    </View>
  );
}
