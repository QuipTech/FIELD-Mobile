import { AlertTriangle, CheckCircle2, Clock, type LucideIcon } from 'lucide-react-native';
import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { formatCents } from '@/features/billing/format';
import { fontFamily, makeStyles, useTheme } from '@/theme';
import type { InvoiceSummary } from './billingApi';

type Tone = 'primary' | 'warning' | 'danger' | 'neutral';

function StatBox(props: {
  label: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: Tone;
}) {
  const styles = useStyles();
  const { colors } = useTheme();
  const fg = {
    primary: colors.primaryStrong,
    warning: colors.warning,
    danger: colors.danger,
    neutral: colors.ink,
  }[props.tone];
  const Icon = props.icon;
  return (
    <View
      style={[styles.box, styles[props.tone]]}
      accessible
      accessibilityLabel={`${props.label}: ${props.value}. ${props.caption}`}
    >
      <View style={styles.head}>
        <Text variant="caption" color="muted" numberOfLines={1} style={{ flex: 1 }}>
          {props.label}
        </Text>
        <Icon size={14} color={fg} strokeWidth={2} />
      </View>
      <Text style={[styles.value, { color: fg }]} numberOfLines={1} adjustsFontSizeToFit>
        {props.value}
      </Text>
      <Text variant="caption" color="muted" numberOfLines={2}>
        {props.caption}
      </Text>
    </View>
  );
}

/** Collected, Outstanding and Pending, as at the top of the portal's Invoices tab. */
export function BillingStats({ summary: s }: { summary: InvoiceSummary }) {
  const paid = s.paid.count;
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      <StatBox
        label="Collected"
        value={formatCents(s.paid.paidCents + s.refunded.paidCents)}
        caption={`${paid} paid invoice${paid === 1 ? '' : 's'}`}
        icon={CheckCircle2}
        tone="primary"
      />
      <StatBox
        label="Outstanding"
        value={formatCents(s.unpaid.totalCents + s.failed.totalCents)}
        caption={`${s.unpaid.count} unpaid · ${s.failed.count} failed`}
        icon={AlertTriangle}
        tone={s.failed.count > 0 ? 'danger' : 'warning'}
      />
      <StatBox
        label="Pending"
        value={String(s.pending.count)}
        caption="Not on Stripe yet or in progress"
        icon={Clock}
        tone="neutral"
      />
    </View>
  );
}

const useStyles = makeStyles((c) => ({
  box: { flex: 1, minHeight: 104, borderRadius: 12, borderWidth: 1, padding: 10, gap: 4 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  value: { fontFamily: fontFamily.semibold, fontSize: 18, lineHeight: 24 },
  primary: { backgroundColor: c.primaryTint, borderColor: c.primaryTintStrong },
  warning: { backgroundColor: c.warningTint, borderColor: c.warningTint },
  danger: { backgroundColor: c.dangerTint, borderColor: c.dangerTint },
  neutral: { backgroundColor: c.card, borderColor: c.border },
}));
