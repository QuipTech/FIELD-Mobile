import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { initialsOf } from '@/features/cases/schema';
import { http } from '@/lib/http';
import type { RecentEntry } from './data';

export type AdminKpiKey = 'machinesDown' | 'casesNearBreach' | 'aiToReview' | 'bulletinsToApprove';

export type AdminKpi = { key: AdminKpiKey; label: string; value: number };

export type TeamActivity = {
  id: string;
  initials: string;
  /** e.g. "J. Rossi logged a repair" */
  title: string;
  /** e.g. "HT-12 · Hydraulics · 40 min ago" */
  detail: string;
};

export type AdminHomeData = { kpis: AdminKpi[]; team: TeamActivity[] };

const total = z.union([z.number(), z.object({ total: z.number() }).transform((t) => t.total)]);

// GET /dashboard/admin (Backend API Reference §6). Only the totals are shown on Home.
const adminDashboard = z.object({
  machinesDown: total,
  casesNearSlaBreach: total,
  aiAnswersToReview: total,
  bulletinsToApprove: total,
});

const LABELS: Record<AdminKpiKey, string> = {
  machinesDown: 'Machines down',
  casesNearBreach: 'Cases near SLA breach',
  aiToReview: 'AI answers to review',
  bulletinsToApprove: 'Bulletins to approve',
};

export function toAdminHome(raw: unknown, activity: RecentEntry[]) {
  const d = adminDashboard.parse(raw);
  const values: Record<AdminKpiKey, number> = {
    machinesDown: d.machinesDown,
    casesNearBreach: d.casesNearSlaBreach,
    aiToReview: d.aiAnswersToReview,
    bulletinsToApprove: d.bulletinsToApprove,
  };
  return {
    kpis: (Object.keys(LABELS) as AdminKpiKey[]).map((key) => ({
      key,
      label: LABELS[key],
      value: values[key],
    })),
    // Fleet-wide recent activity from GET /dashboard; the caption starts with who did it.
    team: activity.slice(0, 5).map((a) => ({
      id: a.id,
      initials: initialsOf(a.detail.split(' · ')[0] ?? a.title),
      title: a.title,
      detail: a.detail,
    })),
  } satisfies AdminHomeData;
}

/** Admin KPIs (`403` for everyone else, so only fetched for admins). */
export function useAdminHomeData(enabled: boolean, activity: RecentEntry[] = []) {
  const query = useQuery({
    queryKey: ['dashboard', 'admin'],
    enabled,
    queryFn: () => http.get<unknown>('/dashboard/admin'),
  });
  return { ...query, data: query.data ? toAdminHome(query.data, activity) : undefined };
}
