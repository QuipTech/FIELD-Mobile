import { useState } from 'react';
import { View } from 'react-native';

import { BrandButton } from '@/components/BrandButton/BrandButton';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { styles } from '@/features/me/styles';
import { AddressForm } from './AddressForm';
import type { BillingAddress } from './address';
import { formatBillingMonth, formatCents, formatPeriod } from './format';
import { billingStyles } from './styles';
import type { PersonalStatus } from './types';

export type PersonalSectionProps = {
  status: PersonalStatus;
  /** 'web': show the status only and send the user to the portal to pay (see app.config). */
  checkout: 'in-app' | 'web';
  webBillingUrl: string;
  paying: boolean;
  /** Why the last Pay now failed; it's safe to try again. */
  payError?: string;
  onPay: (address: BillingAddress) => void;
};

/** The technician's own monthly fee: exempt, covered, due, or paid. */
export function PersonalSection(props: PersonalSectionProps) {
  const { status } = props;
  if (status.exempt)
    return <StatusCard title="No payment needed" caption="Owners aren't charged a monthly fee." />;
  if (status.coveredByOrganisation)
    return (
      <StatusCard
        title="Covered by your organisation"
        caption="Your organisation pays for your seat, so there's nothing for you to pay."
      />
    );
  if (status.paymentRequired) return <PaymentDue {...props} />;
  return (
    <StatusCard
      title="Paid for this month"
      caption={formatPeriod(status.periodStart, status.periodEnd)}
      pill="Paid"
    />
  );
}

function StatusCard({ title, caption, pill }: { title: string; caption: string; pill?: string }) {
  return (
    <View style={styles.card}>
      <View style={styles.splitRow}>
        <Text style={styles.planTitle} accessibilityRole="header">
          {title}
        </Text>
        {pill && <Pill label={pill} tone="neutral" />}
      </View>
      <Text variant="caption" color="inkMuted">
        {caption}
      </Text>
    </View>
  );
}

function PaymentDue({
  status,
  checkout,
  webBillingUrl,
  paying,
  payError,
  onPay,
}: PersonalSectionProps) {
  // Kept after an attempt (cancelled on Stripe, declined, or failed) so paying again is one tap.
  const [address, setAddress] = useState<BillingAddress | null>(null);
  const [lastAddress, setLastAddress] = useState<BillingAddress>();
  const [showForm, setShowForm] = useState(false);
  const pay = (next: BillingAddress) => {
    setAddress(next);
    setLastAddress(next);
    onPay(next);
  };

  return (
    <View style={styles.card}>
      <View style={styles.splitRow}>
        <Text style={styles.planTitle} accessibilityRole="header">
          {formatBillingMonth(status.periodStart)}
        </Text>
        <Pill label="Due" tone="amber" />
      </View>
      <View style={styles.baselineRow}>
        <Text style={billingStyles.price}>{formatCents(status.monthlyCents)}</Text>
        <Text variant="caption" color="inkMuted">
          per month, ex GST
        </Text>
      </View>
      <Text variant="caption" color="inkMuted">
        {formatPeriod(status.periodStart, status.periodEnd)}
        {status.totalCents != null ? ` · ${formatCents(status.totalCents)} incl. GST` : ''}
      </Text>
      <View style={styles.hairline} />

      {checkout === 'web' ? (
        <Text variant="caption" color="inkMuted" selectable>
          Pay for this month from Billing on the FIELD website: {webBillingUrl}. This screen updates
          once it&apos;s paid.
        </Text>
      ) : address ? (
        <View style={billingStyles.form}>
          {payError && (
            <Text variant="caption" color="danger" accessibilityLiveRegion="polite">
              {payError}
            </Text>
          )}
          <BrandButton
            label={payError ? 'Try again' : 'Pay now'}
            onPress={() => onPay(address)}
            loading={paying}
          />
          <BrandButton
            label="Change address"
            variant="outline"
            onPress={() => setAddress(null)}
            disabled={paying}
          />
        </View>
      ) : showForm ? (
        <AddressForm busy={paying} initial={lastAddress} onSubmit={pay} />
      ) : (
        <BrandButton label="Pay now" onPress={() => setShowForm(true)} />
      )}
    </View>
  );
}
