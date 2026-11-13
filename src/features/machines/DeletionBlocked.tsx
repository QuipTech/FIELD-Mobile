import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button/Button';
import { Card } from '@/components/Card/Card';
import { Text } from '@/components/Text/Text';
import { toast } from '@/components/Toast/store';
import { formatBillingDay, formatBillingMonth, formatCents } from '@/features/billing/format';
import {
  PaymentSheetFailedError,
  paymentSheetAvailable,
  payWithPaymentSheet,
} from '@/features/billing/paymentSheet';
import { billingErrorMessage, openHostedPage } from '@/features/billing/stripeBrowser';
import { usePayFinalCharge, type DeletionBlocker, type DeletionCheck } from './lifecycleApi';

const FALLBACK: Record<DeletionBlocker, string> = {
  needs_deactivation: 'Deactivate this machine first. You then pay for the days it was used.',
  sold: 'This machine was sold, so it can’t be deleted.',
  open_cases: 'Close this machine’s open cases first.',
  pending_transfer: 'A transfer of this machine is pending.',
  awaiting_final_invoice: 'The final invoice for this machine hasn’t been issued yet.',
  unpaid_invoices: 'Pay the invoices below to delete this machine.',
  final_charge_due: 'Pay for the days this machine was used this month to delete it.',
};

const INVOICE_STATUS: Record<string, string> = {
  draft: 'Awaiting payment',
  open: 'Due',
  uncollectible: 'Payment failed',
};

/** Reloads the deletion check and hands back the new one. */
type Recheck = () => Promise<DeletionCheck | undefined>;

/** Whether the check still wants money before the machine can go. */
const owesMoney = (c: DeletionCheck | undefined) =>
  !!c && !c.canDelete && (c.blocker === 'final_charge_due' || c.blocker === 'unpaid_invoices');

/** Stripe tells the API by webhook, so a paid charge can take a few seconds to clear. */
async function waitUntilSettled(recheck: Recheck, tries = 5, gapMs = 2000) {
  for (let i = 0; i < tries; i++) {
    const next = await recheck().catch(() => undefined);
    if (!owesMoney(next)) return true;
    if (i < tries - 1) await new Promise((r) => setTimeout(r, gapMs));
  }
  return false;
}

/**
 * Taking the final charge. Every press asks the API for the charge again (it re-finds the same
 * one), so a cancelled sheet, a declined card or a dropped connection just leaves the Pay button
 * there to try again. Only the API's deletion check decides that it's paid.
 */
function usePayment(machineId: string, recheck: Recheck) {
  const raise = usePayFinalCharge(machineId);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const confirm = async () => {
    setConfirming(true);
    try {
      const settled = await waitUntilSettled(recheck);
      toast.show(
        settled
          ? 'Payment received. You can now delete this machine.'
          : 'Payment is still processing. Tap Check again in a moment.',
      );
    } finally {
      setConfirming(false);
    }
  };

  /** Hosted invoice page: no result comes back, so check once it's closed. */
  const payHosted = async (url: string) => {
    setBusy(true);
    try {
      await openHostedPage(url);
    } catch (e) {
      toast.show(billingErrorMessage(e));
    } finally {
      setBusy(false);
    }
    await confirm();
  };

  const payFinalCharge = async () => {
    setBusy(true);
    try {
      const res = await raise.mutateAsync();
      // Builds without the native sheet (older binaries on an OTA update) use the hosted page.
      if (res.paymentSheet && (paymentSheetAvailable() || !res.paymentUrl)) {
        const outcome = await payWithPaymentSheet(res.paymentSheet);
        setBusy(false);
        if (outcome === 'paid') await confirm();
        else {
          toast.show('Payment cancelled. Pay any time to delete this machine.');
          void recheck();
        }
      } else if (res.paymentUrl) {
        setBusy(false);
        await payHosted(res.paymentUrl);
      } else {
        // Nothing left to pay (already settled): just check again.
        setBusy(false);
        await confirm();
      }
    } catch (e) {
      setBusy(false);
      toast.show(e instanceof PaymentSheetFailedError ? e.message : billingErrorMessage(e));
      void recheck();
    }
  };

  return { busy, confirming, payFinalCharge, payHosted };
}

/** Why the machine can't be deleted yet, and the step that unblocks it when there is one. */
export function DeletionBlocked({
  machineId,
  check,
  onRecheck,
  onDeactivate,
}: {
  machineId: string;
  check: DeletionCheck;
  onRecheck: Recheck;
  onDeactivate: () => void;
}) {
  const pay = usePayment(machineId, onRecheck);
  const working = pay.busy || pay.confirming;
  const blocker = check.blocker;
  const message = check.message ?? (blocker ? FALLBACK[blocker] : 'This machine can’t be deleted.');

  return (
    <>
      <Text variant="section">Can’t delete yet</Text>
      <Text color="muted">{message}</Text>
      {!!check.finalInvoiceFrom && (
        <Text variant="caption" color="muted">
          Final invoice from {formatBillingDay(check.finalInvoiceFrom)}.
        </Text>
      )}
      {blocker === 'needs_deactivation' && (
        <Button label="Deactivate machine" variant="danger" onPress={onDeactivate} />
      )}
      {blocker === 'unpaid_invoices' &&
        check.unpaidInvoices.map((inv) => {
          // The final charge is always payable through the API, even while its invoice is a
          // draft with no hosted page yet; other invoices need their hosted page.
          const onPay = inv.isFinalCharge
            ? pay.payFinalCharge
            : inv.hostedInvoiceUrl
              ? () => void pay.payHosted(inv.hostedInvoiceUrl!)
              : null;
          return (
            <Card key={inv.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text>
                  {inv.isFinalCharge
                    ? 'Final charge'
                    : inv.periodStart
                      ? formatBillingMonth(inv.periodStart)
                      : 'Invoice'}
                </Text>
                <Text variant="caption" color="muted">
                  {onPay
                    ? (INVOICE_STATUS[inv.status] ?? inv.status)
                    : 'Being issued. Check again shortly.'}
                </Text>
              </View>
              {onPay && (
                <Button
                  label="Pay"
                  size="small"
                  onPress={() => void onPay()}
                  loading={working}
                  accessibilityHint="Opens the payment sheet"
                />
              )}
            </Card>
          );
        })}
      {blocker === 'final_charge_due' && check.finalCharge && (
        <>
          <FinalChargeBreakdown charge={check.finalCharge} />
          <Button
            label="Pay final charge"
            onPress={() => void pay.payFinalCharge()}
            loading={working}
          />
        </>
      )}
      {pay.confirming && (
        <Text variant="caption" color="muted">
          Confirming your payment…
        </Text>
      )}
    </>
  );
}

/** Month-by-month final charge for the days the machine was used. */
export function FinalChargeBreakdown({
  charge,
}: {
  charge: NonNullable<DeletionCheck['finalCharge']>;
}) {
  return (
    <Card style={{ gap: 10 }}>
      {charge.months.map((m) => (
        <View key={m.periodStart} style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Text>{formatBillingMonth(m.periodStart)}</Text>
            <Text variant="caption" color="muted">
              {m.daysUsed} / {m.daysInMonth} days · {formatCents(m.monthlyRateCents)} a month · last
              used {formatBillingDay(m.lastUsedOn)}
            </Text>
          </View>
          <Text>{formatCents(m.amountCents)}</Text>
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="bodyStrong">Total (ex GST)</Text>
        <Text variant="bodyStrong">{formatCents(charge.amountCents)}</Text>
      </View>
    </Card>
  );
}
