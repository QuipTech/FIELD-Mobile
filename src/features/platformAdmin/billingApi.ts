import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';

/** Platform billing: every invoice across organisations and technicians (portal: Billing › Invoices). */

export const INVOICE_CATEGORIES = [
  'paid',
  'unpaid',
  'failed',
  'pending',
  'refunded',
  'void',
] as const;
export type InvoiceCategory = (typeof INVOICE_CATEGORIES)[number];

const bucket = z.object({
  count: z.number().default(0),
  paidCents: z.number().default(0),
  totalCents: z.number().default(0),
});
const empty = { count: 0, paidCents: 0, totalCents: 0 };
const summary = z.object(
  Object.fromEntries(INVOICE_CATEGORIES.map((c) => [c, bucket.default(empty)])) as Record<
    InvoiceCategory,
    z.ZodDefault<typeof bucket>
  >,
);
export type InvoiceSummary = z.infer<typeof summary>;

const cents = z
  .number()
  .nullish()
  .transform((v) => v ?? 0);
const adminInvoice = z
  .object({
    id: z.string(),
    kind: z.string().nullish(),
    invoiceKind: z.string().nullish(),
    status: z.string().nullish(),
    category: z.enum(INVOICE_CATEGORIES).catch('pending'),
    payerName: z.string().nullish(),
    payerEmail: z.string().nullish(),
    organisationName: z.string().nullish(),
    periodStart: z.string().nullish(),
    totalCents: z.number().nullish(),
    totalExGstCents: cents,
    gstCents: z.number().nullish(),
    amountPaidCents: cents,
    amountRefundedCents: cents,
    amountCreditedCents: cents,
    heldAt: z.string().nullish(),
    hostedInvoiceUrl: z.string().nullish(),
    stripeInvoiceId: z.string().nullish(),
    createdAt: z.string().nullish(),
  })
  .loose();
export type AdminInvoice = z.infer<typeof adminInvoice>;

const overviewPage = z.object({
  summary: summary.optional(),
  items: z.array(adminInvoice).default([]),
  total: z.number().default(0),
});

const PAGE_SIZE = 25;

export const billingOverviewKeys = {
  all: ['admin', 'billing', 'overview'] as const,
  list: (category: string, search: string) =>
    ['admin', 'billing', 'overview', category, search] as const,
};

/** Invoices, newest first, 25 a page; the first page also carries the summary for the boxes. */
export function useAdminInvoices(category: InvoiceCategory | '', search: string) {
  return useInfiniteQuery({
    queryKey: billingOverviewKeys.list(category, search),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) =>
      overviewPage.parse(
        await http.get('/admin/billing/overview/invoices', {
          query: {
            page: pageParam,
            pageSize: PAGE_SIZE,
            ...(category && { category }),
            ...(search && { search }),
          },
          signal,
        }),
      ),
    getNextPageParam: (last, pages) =>
      pages.length * PAGE_SIZE < last.total && last.items.length > 0 ? pages.length + 1 : undefined,
  });
}

const refreshResult = z.object({
  checked: z.number().default(0),
  updated: z.number().default(0),
  failed: z.number().default(0),
});

/** Asks Stripe about every unpaid invoice; resolves to a sentence for a toast. */
export function useRefreshFromStripe() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const r = refreshResult.parse(
        await http.post('/admin/billing/overview/refresh-from-stripe', undefined, { retry: false }),
      );
      if (r.checked === 0) return 'Every invoice is up to date. Nothing is waiting on Stripe.';
      const s = r.checked === 1 ? '' : 's';
      const failed = r.failed ? `, ${r.failed} couldn't be checked.` : '.';
      return `Checked ${r.checked} unpaid invoice${s} with Stripe: ${r.updated} newly paid${failed}`;
    },
    onSettled: () => client.invalidateQueries({ queryKey: billingOverviewKeys.all }),
  });
}

/** Who the invoice is for: the technician (personal) or the organisation. */
export function billedTo(i: AdminInvoice) {
  return i.kind === 'personal'
    ? (i.payerName ?? i.payerEmail ?? 'Unknown user')
    : (i.organisationName ?? 'Organisation');
}
