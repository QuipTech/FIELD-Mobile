import { View } from 'react-native';

import { Text } from '@/components/Text/Text';
import { PaymentCard } from '@/features/me/BillingCards';
import { styles } from '@/features/me/styles';
import { formatBytes, formatNumber } from '@/lib/format';
import { formatBillingDay, formatCents } from './format';
import { InvoiceList } from './InvoiceList';
import { OrganisationPlanCard, type PlanActions } from './OrganisationPlanCard';
import { billingStyles } from './styles';
import type { InvoiceItem, OrganisationSummary } from './types';

export type OrganisationSectionProps = PlanActions & {
  summary: OrganisationSummary;
  invoices: InvoiceItem[];
  onManagePayment: () => void;
  onOpenInvoice: (invoice: InvoiceItem) => void;
  onPayInvoice: (invoice: InvoiceItem) => void;
};

const METRICS: Record<string, string> = {
  ai_turns: 'AI questions',
  storage_bytes: 'Storage',
  ingest_pages: 'Document pages added',
};

/** Billing admins: suspension, plan, this month, fair use, payment method and invoices. */
export function OrganisationSection({
  summary,
  invoices,
  onManagePayment,
  onOpenInvoice,
  onPayInvoice,
  ...actions
}: OrganisationSectionProps) {
  const { account, overdue, plan } = summary;
  return (
    <>
      {account.suspendedAt ? (
        <Notice danger title="Account suspended">
          An invoice is overdue, so new machine activations and new AI sessions are blocked.
          Everything else still works. Pay the overdue invoice to lift it.
        </Notice>
      ) : overdue.count > 0 ? (
        <Notice title={`${overdue.count} overdue invoice${overdue.count === 1 ? '' : 's'}`}>
          {formatCents(overdue.amountCents)} is overdue.
          {overdue.suspensionFrom
            ? ` The account can be suspended from ${formatBillingDay(overdue.suspensionFrom)}.`
            : ''}
        </Notice>
      ) : null}

      {plan ? (
        <OrganisationPlanCard plan={plan} {...actions} />
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>No plan yet</Text>
          <Text variant="caption" color="inkMuted">
            Choose a plan on the FIELD website.
          </Text>
        </View>
      )}

      <ThisMonth summary={summary} />

      {summary.allowance.length > 0 && (
        <>
          <SectionTitle>Fair use this month</SectionTitle>
          <View style={styles.card}>
            {summary.allowance.map((row) => (
              <View key={row.metric} style={styles.baselineRow}>
                <Text variant="caption">{METRICS[row.metric] ?? row.metric}</Text>
                <Text variant="caption" color={row.thresholdState === 'ok' ? 'inkMuted' : 'amber'}>
                  {row.metric === 'storage_bytes'
                    ? `${formatBytes(row.used)} of ${formatBytes(row.allowance)}`
                    : `${formatNumber(row.used)} of ${formatNumber(row.allowance)}`}
                </Text>
              </View>
            ))}
            <Text variant="caption" color="inkMuted">
              Reaching an allowance never blocks or charges anything.
            </Text>
          </View>
        </>
      )}

      <PaymentMethod account={account} onManage={onManagePayment} />

      <SectionTitle>Invoices</SectionTitle>
      <InvoiceList invoices={invoices} onOpen={onOpenInvoice} onPay={onPayInvoice} />
    </>
  );
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text style={styles.sectionTitle} accessibilityRole="header">
      {children}
    </Text>
  );
}

function Notice({
  title,
  danger,
  children,
}: {
  title: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[billingStyles.notice, danger && billingStyles.noticeDanger]}
      accessibilityRole="alert"
    >
      <Text style={styles.cardTitle}>{title}</Text>
      <Text variant="caption">{children}</Text>
    </View>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={billingStyles.stat}>
      <Text style={billingStyles.statValue}>{value}</Text>
      <Text variant="caption" color="inkMuted">
        {label}
      </Text>
    </View>
  );
}

function ThisMonth({ summary }: { summary: OrganisationSummary }) {
  const { thisMonth, plan } = summary;
  return (
    <>
      <SectionTitle>This month</SectionTitle>
      <View style={styles.card}>
        <View style={billingStyles.stats}>
          <Stat label="Active machines today" value={formatNumber(thisMonth.activeToday)} />
          <Stat label="Peak so far" value={formatNumber(thisMonth.peakSoFar)} />
          {thisMonth.rateCents != null && (
            <Stat label="Per machine" value={formatCents(thisMonth.rateCents)} />
          )}
          {thisMonth.estimateCents != null && (
            <Stat
              // Annual plans are prepaid: only machines above the commitment are added monthly.
              label={
                plan?.term === 'annual'
                  ? 'Above your commitment so far, ex GST'
                  : 'Charge so far, ex GST'
              }
              value={formatCents(thisMonth.estimateCents)}
            />
          )}
        </View>
        <Text variant="caption" color="inkMuted">
          Invoiced on {formatBillingDay(thisMonth.invoicedOn)}.
        </Text>
      </View>
    </>
  );
}

function PaymentMethod({
  account,
  onManage,
}: {
  account: OrganisationSummary['account'];
  onManage: () => void;
}) {
  return (
    <>
      <SectionTitle>Payment method</SectionTitle>
      <PaymentCard
        payment={{ processor: 'Stripe' }}
        onManage={onManage}
        disabled={account.hasStripeCustomer === false}
      />
      <Text variant="caption" color="inkMuted">
        {account.hasStripeCustomer === false
          ? 'Payment methods open once your first invoice has been issued.'
          : 'A card or direct debit saved in Stripe pays new invoices automatically; otherwise ' +
            'invoices are emailed with 14-day terms.'}
        {account.billingEmail
          ? ` Invoices for ${account.name ?? 'your organisation'} go to ${account.billingEmail}.`
          : ''}
      </Text>
    </>
  );
}
