import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { refreshAccess, useAccess } from '@/auth/access';
import { getApiSession, updateApiUser } from '@/auth/apiSession';
import type { CurrentUser } from '@/auth/useCurrentUser';
import { queryClient } from '@/lib/queryClient';
import { http } from '@/lib/http';
import type { Plan, PlanStatus } from './data';
import type { AvatarFile } from './pickAvatar';

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
    endsOn: z.string().nullish(),
    renewsAutomatically: z.boolean().nullish(),
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
  if (status === 'free') return 'free';
  if (status === 'expiring_soon') return 'expiringSoon';
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
    renewsOn: s.endsOn || s.currentPeriodEnd || s.endDate || s.endsAt || '',
    renewsAutomatically: s.renewsAutomatically ?? true,
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

const avatarResponse = z
  .union([
    z.object({ avatarUrl: z.string() }).loose(),
    z.object({ user: z.object({ avatarUrl: z.string() }).loose() }).transform((r) => r.user),
    z.object({ data: z.object({ avatarUrl: z.string() }).loose() }).transform((r) => r.data),
  ])
  .transform((r) => r.avatarUrl);

function setAvatarUrl(avatarUrl: string) {
  queryClient.setQueryData<CurrentUser>(['currentUser'], (user) =>
    user ? { ...user, avatarUrl } : user,
  );
  useAccess.setState((state) => ({
    profile: state.profile ? { ...state.profile, avatarUrl } : null,
  }));
}

/**
 * Replaces the profile photo (`POST /users/me/avatar`, multipart `file`).
 * TODO(api): confirm the field name and response; we read `avatarUrl` if it is returned and
 * otherwise pick it up from `/auth/me`.
 */
export function useUploadAvatar() {
  return useMutation({
    mutationFn: (file: AvatarFile) => {
      const form = new FormData();
      // React Native's FormData takes a file descriptor object for local files.
      form.append('file', file as never);
      return http.post('/users/me/avatar', form, { retry: false });
    },
    onSuccess: async (response) => {
      const parsed = avatarResponse.safeParse(response);
      if (parsed.success) {
        setAvatarUrl(parsed.data);
        const session = await getApiSession();
        if (session) await updateApiUser({ ...session.user, avatarUrl: parsed.data });
      }
      // Also stores the new avatarUrl in the API session (shown by Home, Me and the drawer).
      await refreshAccess();
    },
  });
}

/** Updates the profile (`PATCH /users/me`); only the fields sent change. */
export function useUpdateProfile(onSaved?: () => void) {
  return useMutation({
    mutationFn: (patch: ProfilePatch) => http.patch('/users/me', patch),
    onSuccess: async (_, patch) => {
      // Keep the displayed name current even when Cognito still has the sign-up name.
      const names = {
        ...(patch.firstName !== undefined ? { firstName: patch.firstName } : {}),
        ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
      };
      queryClient.setQueryData<CurrentUser>(['currentUser'], (user) =>
        user ? { ...user, ...names } : user,
      );
      useAccess.setState((state) => ({
        profile: state.profile ? { ...state.profile, ...patch } : null,
      }));
      const session = await getApiSession();
      if (session) await updateApiUser({ ...session.user, ...names });
      await refreshAccess();
      onSaved?.();
    },
  });
}
