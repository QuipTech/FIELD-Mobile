import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { http } from '@/lib/http';
import type { Plan, PlanStatus } from './data';

/** Subscription and team size (Backend API Reference §5). Billing lives in features/billing. */

export const meKeys = {
  subscription: ['organisation', 'subscription'] as const,
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

/** The organisation's plan. Everyone can read it; billing actions need `billing.manage`. */
export function useSubscription() {
  return useQuery({
    queryKey: meKeys.subscription,
    staleTime: 10 * 60_000,
    queryFn: async () => toPlan(await http.get('/organisation/subscription')),
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
