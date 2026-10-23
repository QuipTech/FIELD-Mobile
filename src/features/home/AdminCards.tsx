import { LifeBuoy } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/Text/Text';
import type { SupportCase } from '@/features/cases/data';
import { colors } from '@/theme';
import type { AdminKpi, AdminKpiKey, TeamActivity } from './adminData';
import { styles } from './styles';

const KPI_COLOR: Partial<Record<AdminKpiKey, string>> = {
  machinesDown: colors.danger,
  casesNearBreach: colors.amber,
};

/** Admin H1: 2×2 tiles, each opening the list it counts. */
export function KpiGrid({
  kpis,
  onOpen,
}: {
  kpis: AdminKpi[];
  onOpen: (key: AdminKpiKey) => void;
}) {
  return (
    <View style={styles.kpiGrid}>
      {kpis.map((k) => (
        <Pressable
          key={k.key}
          onPress={() => onOpen(k.key)}
          style={({ pressed }) => [styles.card, styles.kpi, pressed && styles.tilePressed]}
          accessibilityRole="button"
          accessibilityLabel={`${k.value} ${k.label}`}
        >
          <Text style={[styles.kpiValue, { color: KPI_COLOR[k.key] ?? colors.ink }]}>
            {k.value}
          </Text>
          <Text variant="caption" color="inkMuted">
            {k.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Admin H1: what the team did today, newest first. */
export function TeamActivityCard({ items }: { items: TeamActivity[] }) {
  return (
    <>
      <View style={styles.baselineRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          Team activity
        </Text>
        <Text variant="caption" color="inkMuted">
          Today
        </Text>
      </View>
      {items.map((item) => (
        <View
          key={item.id}
          style={styles.card}
          accessible
          accessibilityLabel={`${item.title}. ${item.detail}`}
        >
          <View style={styles.cardRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.initials}</Text>
            </View>
            <View style={styles.cardText}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text variant="caption" color="inkMuted">
                {item.detail}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </>
  );
}

/** Customer H1: my open cases, with a link to the full list. */
export function OpenCasesCard({
  cases,
  onOpenCase,
  onSeeAllCases,
}: {
  cases: SupportCase[];
  onOpenCase: (id: string) => void;
  onSeeAllCases: () => void;
}) {
  if (cases.length === 0) return null;
  return (
    <>
      <View style={styles.baselineRow}>
        <Text style={styles.sectionTitle} accessibilityRole="header">
          My open cases
        </Text>
        <Text variant="caption" color="brand" onPress={onSeeAllCases} accessibilityRole="link">
          See all
        </Text>
      </View>
      {cases.map((c) => (
        <Pressable
          key={c.id}
          onPress={() => onOpenCase(c.id)}
          style={styles.card}
          accessibilityRole="button"
          accessibilityLabel={`Case ${c.id}, ${c.title}, ${c.summary}`}
        >
          <View style={styles.cardRow}>
            <View style={[styles.iconBox, { backgroundColor: colors.brandTint }]}>
              <LifeBuoy size={20} color={colors.brandDeep} strokeWidth={2} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.itemTitle}>
                #{c.id} {c.title}
              </Text>
              <Text variant="caption" color="inkMuted">
                {c.summary}
              </Text>
            </View>
          </View>
        </Pressable>
      ))}
    </>
  );
}
