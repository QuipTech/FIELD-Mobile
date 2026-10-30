import { ShieldCheck } from 'lucide-react-native';
import { View } from 'react-native';

import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { colors } from '@/theme';
import type { Plan } from './data';
import { PLAN_STATUS, planWhen } from './status';
import { styles } from './styles';

export type ProfileSummaryProps = {
  name: string;
  email: string;
  initials: string;
  isAdmin: boolean;
  site: string;
};

/** Avatar, name, account email and role · site chip. */
export function ProfileSummary({ name, email, initials, isAdmin, site }: ProfileSummaryProps) {
  return (
    <View style={styles.profile}>
      <View style={styles.avatar} accessibilityElementsHidden importantForAccessibility="no">
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.profileText}>
        <Text style={styles.name} accessibilityRole="header" numberOfLines={1}>
          {name}
        </Text>
        {!!email && (
          <Text variant="caption" color="inkMuted" numberOfLines={1}>
            {email}
          </Text>
        )}
        <View style={styles.rolePill}>
          <Pill
            label={[isAdmin ? 'Admin' : 'Technician', site].filter(Boolean).join(' · ')}
            tone={isAdmin ? 'brand' : 'neutral'}
          />
        </View>
      </View>
    </View>
  );
}

/** Current subscription at a glance. */
export function PlanCard({ plan }: { plan: Plan }) {
  const status = PLAN_STATUS[plan.status];
  const when = planWhen(plan);
  return (
    <View
      style={styles.card}
      accessible
      accessibilityLabel={`${plan.name}, ${status.label}. ${when}`}
    >
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, styles.iconBoxLarge, { backgroundColor: colors.brandTint }]}>
          <ShieldCheck size={20} color={colors.brand} strokeWidth={2} />
        </View>
        <View style={styles.cardText}>
          <Text style={styles.cardTitle}>{plan.name}</Text>
          <Text variant="caption" color="inkMuted">
            {when}
          </Text>
        </View>
        <Pill label={status.label} tone={status.tone} />
      </View>
    </View>
  );
}
