import { CreditCard } from 'lucide-react-native';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatDate } from '@/lib/date';
import { formatNumber } from '@/lib/format';
import { colors } from '@/theme';
import type { BillingData, Plan } from './data';
import { PLAN_STATUS } from './status';
import { styles } from './styles';

/** Plan name, status, what it's billed on and when it renews. */
export function PlanOverview({ plan }: { plan: Plan }) {
  const status = PLAN_STATUS[plan.status];
  const assets = `${formatNumber(plan.assets)} asset${plan.assets === 1 ? '' : 's'}`;
  return (
    <View style={styles.card}>
      <View style={styles.splitRow}>
        <Text style={styles.planTitle} accessibilityRole="header">
          {plan.name}
        </Text>
        <Pill label={status.label} tone={status.tone} />
      </View>
      <Text variant="caption" color="inkMuted">
        Billed per asset, {plan.cadence === 'monthly' ? 'monthly' : 'annually'} · {assets}
      </Text>
      <View style={styles.hairline} />
      <View style={styles.splitRow}>
        <Text variant="caption" color="inkMuted">
          {plan.status === 'cancelled' ? 'Ends' : 'Renews'}
        </Text>
        <Text style={styles.planDate}>{formatDate(plan.renewsOn)}</Text>
      </View>
    </View>
  );
}

/** AI queries used this period against the plan allowance. Overage is billed, never blocked. */
export function AllowanceCard({ used, limit }: BillingData['allowance']) {
  const over = used > limit;
  const pct = limit > 0 ? Math.min(used / limit, 1) * 100 : 0;
  return (
    <View style={styles.card}>
      <View style={styles.baselineRow}>
        <Text style={styles.cardTitle}>
          {formatNumber(used)} / {formatNumber(limit)} queries
        </Text>
        <Text variant="caption" color="inkMuted">
          This period
        </Text>
      </View>
      <View
        style={styles.meterTrack}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="AI queries used this period"
        accessibilityValue={{ min: 0, max: limit, now: Math.min(used, limit) }}
      >
        <View style={[styles.meterFill, over && styles.meterOver, { width: `${pct}%` as const }]} />
      </View>
      <Text variant="caption" color={over ? 'amber' : 'inkMuted'}>
        {over
          ? `${formatNumber(used - limit)} over the allowance — billed as overage, not blocked.`
          : 'Overage above the allowance is billed, not blocked.'}
      </Text>
    </View>
  );
}

export function PaymentCard({
  payment,
  onManage,
}: {
  payment: BillingData['payment'];
  onManage: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={[styles.iconBox, styles.iconBoxLarge]}>
          <CreditCard size={20} color={colors.ink} strokeWidth={2} />
        </View>
        <View
          style={styles.cardText}
          accessible
          accessibilityLabel={`${payment.brand} ending in ${payment.last4}, via ${payment.processor}`}
        >
          <Text style={styles.cardTitle}>
            {payment.brand} •••• {payment.last4}
          </Text>
          <Text variant="caption" color="inkMuted">
            Via {payment.processor}
          </Text>
        </View>
        <BrandButton
          variant="outline"
          label="Manage"
          onPress={onManage}
          style={styles.compactButton}
        />
      </View>
    </View>
  );
}
