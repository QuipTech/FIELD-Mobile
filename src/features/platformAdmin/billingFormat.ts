import type { PillTone } from '@/components/Pill/Pill';
import { toast } from '@/components/Toast/store';
import { formatCents } from '@/features/billing/format';
import { openInAppBrowser } from '@/lib/files';
import { errorMessage } from '@/lib/http';
import type { AdminInvoice, InvoiceCategory } from './billingApi';

export const CATEGORY: Record<InvoiceCategory, { label: string; tone: PillTone; hint: string }> = {
  paid: { label: 'Paid', tone: 'success', hint: 'Paid in full on Stripe' },
  unpaid: { label: 'Unpaid', tone: 'amber', hint: 'Sent to Stripe, waiting for payment' },
  failed: { label: 'Payment failed', tone: 'danger', hint: 'Stripe tried to charge and it failed' },
  pending: {
    label: 'Pending',
    tone: 'brand',
    hint: 'Not on Stripe yet, or a payment is in progress',
  },
  refunded: { label: 'Refunded', tone: 'muted', hint: 'Paid, then refunded in part or in full' },
  void: { label: 'Void', tone: 'muted', hint: 'Cancelled; nothing is owed' },
};

/** "2026-10-01" → "Oct 2026". */
export const shortMonth = (d?: string | null) => {
  const m = d && /^(\d{4})-(\d{2})/.exec(d);
  if (!m) return '—';
  return new Date(Date.UTC(+m[1]!, +m[2]! - 1, 1)).toLocaleDateString('en-AU', {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/** Total incl. GST, or "A$x + GST" before Stripe has worked out the tax. */
export const invoiceTotal = (i: AdminInvoice) =>
  i.totalCents === null || i.totalCents === undefined
    ? `${formatCents(i.totalExGstCents)} + GST`
    : formatCents(i.totalCents);

export async function openStripeInvoice(url: string) {
  try {
    await openInAppBrowser(url);
  } catch (e) {
    toast.show(errorMessage(e));
  }
}
