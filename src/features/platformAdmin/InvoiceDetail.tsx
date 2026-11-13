import { ExternalLink } from 'lucide-react-native';
import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { ModalSheet } from '@/components/ModalSheet/ModalSheet';
import { Pill } from '@/components/Pill/Pill';
import { Text } from '@/components/Text/Text';
import { formatBillingDay, formatCents } from '@/features/billing/format';
import { billedTo, type AdminInvoice } from './billingApi';
import { CATEGORY, invoiceTotal, openStripeInvoice, shortMonth } from './billingFormat';
import { Field } from './shared';

/** One invoice's details, with a link to its Stripe page. */
export function InvoiceDetail({
  invoice: i,
  onClose,
}: {
  invoice?: AdminInvoice;
  onClose: () => void;
}) {
  const cat = i ? CATEGORY[i.category] : undefined;
  return (
    <ModalSheet
      visible={!!i}
      title={i ? billedTo(i) : ''}
      onClose={onClose}
      footer={
        i?.hostedInvoiceUrl ? (
          <Button
            label="Open in Stripe"
            icon={ExternalLink}
            onPress={() => void openStripeInvoice(i.hostedInvoiceUrl!)}
          />
        ) : undefined
      }
    >
      {i && cat && (
        <>
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
            <Pill label={cat.label} tone={cat.tone} />
            {!!i.heldAt && <Pill label="Held for review" tone="amber" />}
          </View>
          <Text variant="caption" color="muted">
            {cat.hint}
          </Text>
          <Field
            label="Billed to"
            value={i.kind === 'personal' ? (i.payerEmail ?? billedTo(i)) : 'Organisation invoice'}
          />
          <Field label="Organisation" value={i.organisationName} />
          <Field label="Month" value={shortMonth(i.periodStart)} />
          <Field label="Total" value={invoiceTotal(i)} />
          <Field label="Ex GST" value={formatCents(i.totalExGstCents)} />
          {i.gstCents !== null && i.gstCents !== undefined && (
            <Field label="GST" value={formatCents(i.gstCents)} />
          )}
          <Field label="Paid" value={formatCents(i.amountPaidCents - i.amountRefundedCents)} />
          {i.amountRefundedCents > 0 && (
            <Field label="Refunded" value={formatCents(i.amountRefundedCents)} />
          )}
          {i.amountCreditedCents > 0 && (
            <Field label="Credited" value={formatCents(i.amountCreditedCents)} />
          )}
          {i.createdAt && <Field label="Created" value={formatBillingDay(i.createdAt)} />}
          {i.stripeInvoiceId && <Field label="Stripe invoice" value={i.stripeInvoiceId} />}
          {!i.hostedInvoiceUrl && (
            <Text variant="caption" color="muted">
              Not on Stripe yet, so there’s no Stripe page to open.
            </Text>
          )}
        </>
      )}
    </ModalSheet>
  );
}
