import { useMutation, useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { z } from 'zod';

import { http } from '@/lib/http';
import type { Invoice, InvoiceStatus, Plan, PlanStatus } from './data';

/** Subscription, invoices, Stripe portal and team size (Backend API Reference §5). */

export const meKeys = {
  subscription: ['organisation', 'subscription'] as const,
  invoices: (org: boolean) => ['billing', 'invoices', org] as const,
  team: ['team', 'summary'] as const,
};

const named = z.union([
  z.string(),
  z
    .object({ name: z.string().nullish(), code: z.string().nullish() })
    .transform((p) => p.name || p.code || ''),
]);

const subscription = z
  .object({
    plan: named.nullish(),
    planName: z.string().nullish(),
    planCode: z.string().nullish(),
    status: z.string().nullish(),
    currentPeriodEnd: z.string().nullish(),
    endDate: z.string().nullish(),
    endsAt: z.string().nullish(),
    assetCount: z.number().nullish(),
    interval: z.string().nullish(),
    billingInterval: z.string().nullish(),
  })
  .loose();

const PLAN_NAMES: Record<string, string> = { ASSET_PRO: 'Asset Pro', ENTERPRISE: 'Enterprise' };

function planStatus(status: string | null | undefined): PlanStatus {
  if (status === 'past_due' || status === 'unpaid' || status === 'pastDue') return 'pastDue';
  if (status === 'canceled' || status === 'cancelled' || status === 'expired') return 'cancelled';
  return 'active';
}

export function toPlan(raw: unknown): Plan {
  const s = subscription.parse(raw);
  const code = s.planName || s.plan || s.planCode || '';
  const interval = s.interval || s.billingInterval || '';
  return {
    name: PLAN_NAMES[code] ?? (code || 'No plan'),
    status: planStatus(s.status),
    renewsOn: s.currentPeriodEnd || s.endDate || s.endsAt || '',
    cadence: /year|annual/i.test(interval) ? 'annual' : 'monthly',
    assets: s.assetCount ?? 0,
  };
}

/** The organisation's plan. Everyone can read it; billing actions need `admin.manage_settings`. */
export function useSubscription() {
  return useQuery({
    queryKey: meKeys.subscription,
    staleTime: 10 * 60_000,
    queryFn: async () => toPlan(await http.get('/organisation/subscription')),
  });
}

const apiInvoice = z
  .object({
    id: z.string(),
    status: z.string().nullish(),
    createdAt: z.string().nullish(),
    issuedAt: z.string().nullish(),
    date: z.string().nullish(),
    totalCents: z.number().nullish(),
    total: z.number().nullish(),
    hostedInvoiceUrl: z.string().nullish(),
    hasPdf: z.boolean().nullish(),
  })
  .loose();

const INVOICE_STATUS: Record<string, InvoiceStatus> = {
  paid: 'paid',
  open: 'due',
  draft: 'due',
  uncollectible: 'failed',
  void: 'failed',
  failed: 'failed',
};

export function toInvoice(i: z.infer<typeof apiInvoice>): Invoice {
  return {
    id: i.id,
    issuedOn: i.issuedAt || i.createdAt || i.date || '',
    status: INVOICE_STATUS[i.status ?? ''] ?? 'due',
    totalCents: i.totalCents ?? i.total ?? undefined,
    url: i.hostedInvoiceUrl ?? undefined,
    hasPdf: i.hasPdf ?? true,
  };
}

const invoiceList = z.union([
  z.array(apiInvoice),
  z.object({ items: z.array(apiInvoice) }).transform((r) => r.items),
]);

const invoiceBase = (org: boolean) =>
  org ? '/organisation/billing/invoices' : '/me/billing/invoices';

/** Organisation invoices for billing admins, otherwise the user's own (TECH) invoices. */
export function useInvoices(org: boolean) {
  return useQuery({
    queryKey: meKeys.invoices(org),
    queryFn: async () => invoiceList.parse(await http.get(invoiceBase(org))).map(toInvoice),
  });
}

const urlResponse = z.object({ url: z.string() });

/** Opens the invoice PDF (a short-lived signed URL) in the browser. */
export function useOpenInvoice(org: boolean) {
  return useMutation({
    mutationFn: async (invoice: Invoice) => {
      const url = invoice.hasPdf
        ? urlResponse.parse(
            await http.get(`${invoiceBase(org)}/${encodeURIComponent(invoice.id)}/pdf`),
          ).url
        : invoice.url;
      if (!url) throw new Error('This invoice has no PDF yet.');
      await Linking.openURL(url);
    },
  });
}

/** Opens the Stripe customer portal. The URL is single-use, so it's fetched on every tap. */
export function useBillingPortal(org: boolean) {
  return useMutation({
    mutationFn: async () => {
      const path = org ? '/organisation/billing/portal-session' : '/me/billing/portal-session';
      await Linking.openURL(urlResponse.parse(await http.post(path)).url);
    },
  });
}

const page = z.object({ total: z.number() });

/** Organisation admins: how many people are on the account. */
export function useTeamSummary(enabled: boolean) {
  return useQuery({
    queryKey: meKeys.team,
    enabled,
    queryFn: async () => ({
      users: page.parse(await http.get('/team', { query: { pageSize: 1 } })).total,
    }),
  });
}

export type ProfilePatch = Partial<{
  firstName: string;
  lastName: string;
  phoneNumber: string;
  site: string;
  /** e.g. `en` or `en-AU`. */
  language: string;
}>;

/** Updates the profile (`PATCH /users/me`); only the fields sent change. */
export function useUpdateProfile(onSaved?: () => void) {
  return useMutation({
    mutationFn: (patch: ProfilePatch) => http.patch('/users/me', patch),
    onSuccess: onSaved,
  });
}
